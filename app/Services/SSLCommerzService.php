<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class SSLCommerzService
{
    public function isDemoMode(): bool
    {
        return (bool) config('services.sslcommerz.demo_mode', true);
    }

    public function gatewayUrl(): string
    {
        $baseUrl = rtrim((string) config('services.sslcommerz.base_url', 'https://sandbox.sslcommerz.com'), '/');

        return $baseUrl.'/gwprocess/v4/api.php';
    }

    public function buildCheckoutPayload(Payment $payment, User $user, array $urls): array
    {
        return [
            'store_id' => config('services.sslcommerz.store_id'),
            'store_passwd' => config('services.sslcommerz.store_password'),
            'total_amount' => number_format((float) $payment->amount, 2, '.', ''),
            'currency' => $payment->currency,
            'tran_id' => $payment->transaction_id,
            'success_url' => $urls['success_url'],
            'fail_url' => $urls['fail_url'],
            'cancel_url' => $urls['cancel_url'],
            'ipn_url' => $urls['ipn_url'],
            'cus_name' => $user->name,
            'cus_email' => $user->email,
            'cus_add1' => 'Dhaka',
            'cus_city' => 'Dhaka',
            'cus_country' => 'Bangladesh',
            'cus_phone' => '01700000000',
            'shipping_method' => 'NO',
            'product_name' => optional($payment->plan)->name ?? 'Premium Subscription',
            'product_category' => 'Subscription',
            'product_profile' => 'non-physical-goods',
            'value_a' => (string) $payment->id,
        ];
    }

    public function validate(array $payload): array
    {
        if ($this->isDemoMode() || empty($payload['val_id'])) {
            return ['status' => 'VALID'];
        }

        $baseUrl = rtrim((string) config('services.sslcommerz.base_url', 'https://sandbox.sslcommerz.com'), '/');
        $validationUrl = $baseUrl.'/validator/api/validationserverAPI.php';

        return Http::timeout(15)
            ->get($validationUrl, [
                'val_id' => $payload['val_id'],
                'store_id' => config('services.sslcommerz.store_id'),
                'store_passwd' => config('services.sslcommerz.store_password'),
                'format' => 'json',
            ])
            ->json() ?? [];
    }
}
