<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $activeSubscription = null;

        if ($user) {
            $activeSubscription = Subscription::with('plan')
                ->where('user_id', $user->id)
                ->active()
                ->latest('ends_at')
                ->first();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => $user
                ? $user->notifications()->latest()->limit(5)->get()->map(fn ($notification) => [
                    'id' => $notification->id,
                    'title' => $notification->data['title'] ?? 'Notification',
                    'message' => $notification->data['message'] ?? '',
                    'url' => $notification->data['url'] ?? null,
                    'read_at' => $notification->read_at?->toDateTimeString(),
                    'created_at' => $notification->created_at?->diffForHumans(),
                ])->values()
                : [],
            'unreadNotificationsCount' => fn () => $user ? $user->unreadNotifications()->count() : 0,
            'subscriptionSummary' => [
                'is_premium' => (bool) $activeSubscription,
                'plan_name' => $activeSubscription?->plan?->name ?? 'Free',
                'expires_at' => optional($activeSubscription?->ends_at)?->toDateString(),
            ],
        ];
    }
}
