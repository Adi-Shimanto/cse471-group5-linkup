<?php

namespace App\Http\Controllers;

use App\Models\ConnectionRequest;
use App\Models\Post;
<<<<<<< HEAD
=======
use App\Models\Subscription;
>>>>>>> payment-feature-clean
use App\Models\User;
use App\Models\UserBlock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserSearchController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $currentUserId = $request->user()->id;

<<<<<<< HEAD
        $posts = Post::with('user')
=======
        $blockedByMe = UserBlock::where('blocker_id', $currentUserId)->pluck('blocked_user_id');
        $blockedMe = UserBlock::where('blocked_user_id', $currentUserId)->pluck('blocker_id');
        $allBlockedIds = $blockedByMe->merge($blockedMe)->unique()->values();

        $posts = Post::with('user')
            ->when($allBlockedIds->isNotEmpty(), function ($query) use ($allBlockedIds) {
                $query->whereNotIn('user_id', $allBlockedIds);
            })
>>>>>>> payment-feature-clean
            ->latest()
            ->get();

        $friendCount = ConnectionRequest::where('status', 'accepted')
            ->where(function ($query) use ($currentUserId) {
                $query->where('sender_id', $currentUserId)
                      ->orWhere('receiver_id', $currentUserId);
            })
            ->count();

        $users = [];

        if ($search !== '') {
            $users = User::query()
                ->where('id', '!=', $currentUserId)
<<<<<<< HEAD
=======
                ->when($allBlockedIds->isNotEmpty(), function ($query) use ($allBlockedIds) {
                    $query->whereNotIn('id', $allBlockedIds);
                })
>>>>>>> payment-feature-clean
                ->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                })
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->limit(20)
                ->get()
<<<<<<< HEAD
                ->map(function ($user) use ($currentUserId) {
=======
                ->map(function ($user) use ($currentUserId, $blockedByMe) {
>>>>>>> payment-feature-clean
                    $requestRecord = ConnectionRequest::where(function ($query) use ($currentUserId, $user) {
                        $query->where('sender_id', $currentUserId)
                              ->where('receiver_id', $user->id);
                    })->orWhere(function ($query) use ($currentUserId, $user) {
                        $query->where('sender_id', $user->id)
                              ->where('receiver_id', $currentUserId);
                    })->first();

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'connection_status' => $requestRecord?->status,
                        'is_request_sender' => $requestRecord?->sender_id === $currentUserId,
<<<<<<< HEAD
=======
                        'is_blocked' => $blockedByMe->contains($user->id),
>>>>>>> payment-feature-clean
                    ];
                })
                ->values();
        }

        $incomingRequests = ConnectionRequest::with('sender')
            ->where('receiver_id', $currentUserId)
            ->where('status', 'pending')
<<<<<<< HEAD
=======
            ->when($allBlockedIds->isNotEmpty(), function ($query) use ($allBlockedIds) {
                $query->whereNotIn('sender_id', $allBlockedIds);
            })
>>>>>>> payment-feature-clean
            ->latest()
            ->get()
            ->map(function ($requestItem) {
                return [
                    'id' => $requestItem->id,
                    'sender' => [
                        'id' => $requestItem->sender->id,
                        'name' => $requestItem->sender->name,
                        'email' => $requestItem->sender->email,
                    ],
                ];
            })
            ->values();

<<<<<<< HEAD
=======
        $activeSubscription = Subscription::with('plan')
            ->where('user_id', $currentUserId)
            ->active()
            ->latest('ends_at')
            ->first();

>>>>>>> payment-feature-clean
        return Inertia::render('Dashboard', [
            'users' => $users,
            'posts' => $posts,
            'incomingRequests' => $incomingRequests,
            'friendCount' => $friendCount,
            'filters' => [
                'search' => $search,
            ],
            'premiumStatus' => [
                'is_premium' => (bool) $activeSubscription,
                'plan_name' => $activeSubscription?->plan?->name ?? 'Free',
                'expires_at' => optional($activeSubscription?->ends_at)?->toDateString(),
            ],
        ]);
    }
}
