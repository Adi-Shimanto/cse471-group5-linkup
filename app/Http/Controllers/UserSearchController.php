<?php

namespace App\Http\Controllers;

use App\Models\ConnectionRequest;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserSearchController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $currentUserId = $request->user()->id;

        $posts = Post::with([
            'user',
            'comments.user',
            'reactions',
            'shares'
        ])->latest()->get();

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
                ->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                })
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->limit(20)
                ->get()
                ->map(function ($user) use ($currentUserId) {
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
                    ];
                })
                ->values();
        }

        $incomingRequests = ConnectionRequest::with('sender')
            ->where('receiver_id', $currentUserId)
            ->where('status', 'pending')
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

        return Inertia::render('Dashboard', [
            'users' => $users,
            'posts' => $posts,
            'incomingRequests' => $incomingRequests,
            'friendCount' => $friendCount,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}