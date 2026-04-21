<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureDefaultPlans();

        $plans = Plan::query()
            ->where('is_active', true)
            ->orderBy('price')
            ->get();

        $activeSubscription = Subscription::with('plan')
            ->where('user_id', $request->user()->id)
            ->active()
            ->latest('ends_at')
            ->first();

        $payments = Payment::with('plan')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('Subscriptions', [
            'plans' => $plans,
            'activeSubscription' => $activeSubscription,
            'payments' => $payments,
            'sslcommerzDemoMode' => (bool) config('services.sslcommerz.demo_mode', true),
        ]);
    }

    protected function ensureDefaultPlans(): void
    {
        Plan::firstOrCreate(
            ['slug' => 'free'],
            [
                'name' => 'Free',
                'price' => 0,
                'billing_cycle' => 'lifetime',
                'description' => 'Basic discovery with limited daily search and matchmaking.',
                'features' => [
                    'Limited daily search',
                    'Basic friend discovery',
                    'Standard feed placement',
                ],
                'is_active' => true,
            ]
        );

        Plan::firstOrCreate(
            ['slug' => 'premium-monthly'],
            [
                'name' => 'Premium Monthly',
                'price' => 499,
                'billing_cycle' => 'monthly',
                'description' => 'Unlimited deep matchmaking, priority feeds and an ad-free experience.',
                'features' => [
                    'Unlimited deep matchmaking',
                    'Priority in feeds',
                    'Ad-free experience',
                    'Advanced connection tools',
                ],
                'is_active' => true,
            ]
        );

        Plan::firstOrCreate(
            ['slug' => 'premium-yearly'],
            [
                'name' => 'Premium Yearly',
                'price' => 4999,
                'billing_cycle' => 'yearly',
                'description' => 'Discounted yearly premium access with the full premium feature set.',
                'features' => [
                    'All premium monthly features',
                    'Better yearly value',
                    'Priority support',
                ],
                'is_active' => true,
            ]
        );
    }
}
