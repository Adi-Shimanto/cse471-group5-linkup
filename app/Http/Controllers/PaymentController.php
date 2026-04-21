<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\SSLCommerzService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function checkout(Request $request, Plan $plan): RedirectResponse
    {
        if ($plan->slug === 'free') {
            return back()->with('error', 'The free plan does not require payment.');
        }

        $payment = Payment::create([
            'user_id' => $request->user()->id,
            'plan_id' => $plan->id,
            'transaction_id' => 'LINKUP-'.Str::upper(Str::random(12)),
            'amount' => $plan->price,
            'currency' => 'BDT',
            'status' => 'pending',
            'gateway_name' => 'sslcommerz',
        ]);

        return redirect()->route('payments.redirect', $payment);
    }

    public function redirectToGateway(Request $request, Payment $payment, SSLCommerzService $sslcommerzService): Response
    {
        abort_unless($payment->user_id === $request->user()->id, 403);

        $payload = $sslcommerzService->buildCheckoutPayload($payment, $request->user(), [
            'success_url' => route('payments.success'),
            'fail_url' => route('payments.fail'),
            'cancel_url' => route('payments.cancel'),
            'ipn_url' => route('payments.ipn'),
        ]);

        return Inertia::render('PaymentRedirect', [
            'payment' => $payment->load('plan'),
            'gatewayUrl' => $sslcommerzService->gatewayUrl(),
            'payload' => $payload,
            'demoMode' => $sslcommerzService->isDemoMode(),
        ]);
    }

    public function demoSuccess(Request $request, Payment $payment): RedirectResponse
    {
        abort_unless($payment->user_id === $request->user()->id, 403);

        return $this->completePayment($payment, ['status' => 'VALID', 'mode' => 'demo']);
    }

    public function demoFail(Request $request, Payment $payment): RedirectResponse
    {
        abort_unless($payment->user_id === $request->user()->id, 403);

        $payment->update([
            'status' => 'failed',
            'gateway_response' => ['mode' => 'demo'],
        ]);

        return redirect()->route('subscriptions.index')->with('error', 'Demo payment marked as failed.');
    }

    public function demoCancel(Request $request, Payment $payment): RedirectResponse
    {
        abort_unless($payment->user_id === $request->user()->id, 403);

        $payment->update([
            'status' => 'cancelled',
            'gateway_response' => ['mode' => 'demo'],
        ]);

        return redirect()->route('subscriptions.index')->with('error', 'Demo payment cancelled.');
    }

    public function success(Request $request, SSLCommerzService $sslcommerzService): RedirectResponse
    {
        $payment = Payment::where('transaction_id', $request->input('tran_id'))->firstOrFail();
        $validation = $sslcommerzService->validate($request->all());

        if (! in_array(($validation['status'] ?? null), ['VALID', 'VALIDATED'], true)) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $validation,
            ]);

            return redirect()->route('subscriptions.index')->with('error', 'Payment validation failed.');
        }

        return $this->completePayment($payment, $validation);
    }

    public function fail(Request $request): RedirectResponse
    {
        $payment = Payment::where('transaction_id', $request->input('tran_id'))->first();

        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $request->all(),
            ]);
        }

        return redirect()->route('subscriptions.index')->with('error', 'Payment failed. Please try again.');
    }

    public function cancel(Request $request): RedirectResponse
    {
        $payment = Payment::where('transaction_id', $request->input('tran_id'))->first();

        if ($payment) {
            $payment->update([
                'status' => 'cancelled',
                'gateway_response' => $request->all(),
            ]);
        }

        return redirect()->route('subscriptions.index')->with('error', 'Payment was cancelled.');
    }

    public function ipn(Request $request)
    {
        $payment = Payment::where('transaction_id', $request->input('tran_id'))->first();

        if ($payment) {
            $payment->update([
                'gateway_response' => $request->all(),
            ]);
        }

        return response('OK');
    }

    protected function completePayment(Payment $payment, array $gatewayResponse): RedirectResponse
    {
        if ($payment->status !== 'paid') {
            $payment->update([
                'status' => 'paid',
                'gateway_response' => $gatewayResponse,
                'paid_at' => now(),
            ]);

            Subscription::where('user_id', $payment->user_id)
                ->where('status', 'active')
                ->update(['status' => 'expired']);

            $endsAt = $payment->plan->billing_cycle === 'yearly'
                ? now()->addYear()
                : now()->addMonth();

            Subscription::create([
                'user_id' => $payment->user_id,
                'plan_id' => $payment->plan_id,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => $endsAt,
            ]);
        }

        return redirect()->route('subscriptions.index')->with('success', 'Payment completed and premium subscription activated.');
    }
}
