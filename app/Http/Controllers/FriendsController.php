<?php

namespace App\Http\Controllers;

use App\Models\ConnectionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FriendsController extends Controller
{
    public function index(Request $request): Response
    {
        $authUserId = $request->user()->id;

        $friends = ConnectionRequest::with(['sender:id,name,email', 'receiver:id,name,email'])
            ->where('status', 'accepted')
            ->where(function ($query) use ($authUserId) {
                $query->where('sender_id', $authUserId)
                      ->orWhere('receiver_id', $authUserId);
            })
            ->latest()
            ->get()
            ->map(function (ConnectionRequest $connectionRequest) use ($authUserId) {
                $friend = $connectionRequest->sender_id === $authUserId
                    ? $connectionRequest->receiver
                    : $connectionRequest->sender;

                return [
                    'connection_request_id' => $connectionRequest->id,
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'email' => $friend->email,
                ];
            })
            ->values();

        return Inertia::render('Friends', [
            'friends' => $friends,
            'friendCount' => $friends->count(),
        ]);
    }
}
