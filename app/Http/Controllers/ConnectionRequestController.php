<?php

namespace App\Http\Controllers;

use App\Models\ConnectionRequest;
use App\Models\UserBlock;
use App\Notifications\FriendRequestAcceptedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConnectionRequestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
        ]);

        $senderId = Auth::id();
        $receiverId = (int) $request->receiver_id;

        if ($senderId === $receiverId) {
            return back()->with('error', 'You cannot send a request to yourself.');
        }

        $isBlocked = UserBlock::where(function ($query) use ($senderId, $receiverId) {
            $query->where('blocker_id', $senderId)
                ->where('blocked_user_id', $receiverId);
        })->orWhere(function ($query) use ($senderId, $receiverId) {
            $query->where('blocker_id', $receiverId)
                ->where('blocked_user_id', $senderId);
        })->exists();

        if ($isBlocked) {
            return back()->with('error', 'You cannot send a request because one of you has blocked the other user.');
        }

        $alreadyExists = ConnectionRequest::where(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $senderId)
                  ->where('receiver_id', $receiverId);
        })->orWhere(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $receiverId)
                  ->where('receiver_id', $senderId);
        })->exists();

        if ($alreadyExists) {
            return back()->with('error', 'Request already exists.');
        }

        ConnectionRequest::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Connection request sent.');
    }

    public function accept($id)
    {
        $connectionRequest = ConnectionRequest::with('sender')
            ->where('id', $id)
            ->where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->firstOrFail();

        $connectionRequest->update([
            'status' => 'accepted',
        ]);

        $connectionRequest->sender?->notify(
            new FriendRequestAcceptedNotification(Auth::user(), $connectionRequest)
        );

        return back()->with('success', 'Connection request accepted. The sender has been notified.');
    }

    public function decline($id)
    {
        $connectionRequest = ConnectionRequest::where('id', $id)
            ->where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->firstOrFail();

        $connectionRequest->update([
            'status' => 'declined',
        ]);

        return back()->with('success', 'Connection request declined.');
    }

    public function removeFriend($id)
    {
        $authUserId = Auth::id();

        $connectionRequest = ConnectionRequest::where('id', $id)
            ->where('status', 'accepted')
            ->where(function ($query) use ($authUserId) {
                $query->where('sender_id', $authUserId)
                      ->orWhere('receiver_id', $authUserId);
            })
            ->firstOrFail();

        $connectionRequest->delete();

        return back()->with('success', 'Friend removed successfully.');
    }
}
