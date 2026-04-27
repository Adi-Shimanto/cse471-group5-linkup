<?php

namespace App\Http\Controllers;

use App\Models\ConnectionRequest;
use App\Models\UserBlock;
use App\Notifications\FriendRequestAcceptedNotification;
use App\Traits\LogsActivity;  // ← ADD THIS
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConnectionRequestController extends Controller
{
    use LogsActivity;  // ← ADD THIS

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
        ]);

        $senderId = Auth::id();
        $receiverId = (int) $request->receiver_id;
        $receiver = \App\Models\User::find($receiverId);  // ← ADD THIS to get receiver object

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

        // 🔥 Limit free users to 5 requests per 24 hours
        $user = Auth::user();

        if (!$user->is_premium) {
            $requestsLast24h = ConnectionRequest::where('sender_id', $senderId)
                ->where('created_at', '>=', now()->subDay())
                ->count();

            if ($requestsLast24h >= 5) {
                return back()->with('error', 'You have reached your daily limit of 5 requests.');
            }
        }

        $connectionRequest = ConnectionRequest::create([  // ← Changed to capture the request
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'status' => 'pending',
        ]);

        // ✅ ADD THIS: Log friend request sent
        $this->logActivity(
            'friend_request_sent',
            $receiver,
            'Sent friend request to ' . $receiver->name,
            ['connection_request_id' => $connectionRequest->id, 'receiver_id' => $receiverId]
        );

        return back()->with('success', 'Connection request sent.');
    }

    public function accept($id)
    {
        $connectionRequest = ConnectionRequest::with('sender')
            ->where('id', $id)
            ->where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->firstOrFail();

        $sender = $connectionRequest->sender;  // ← ADD THIS to get sender object

        $connectionRequest->update([
            'status' => 'accepted',
        ]);

        $connectionRequest->sender?->notify(
            new FriendRequestAcceptedNotification(Auth::user(), $connectionRequest)
        );

        // ✅ ADD THIS: Log friend request accepted
        $this->logActivity(
            'friend_request_accepted',
            $sender,
            'Accepted friend request from ' . $sender->name,
            ['connection_request_id' => $connectionRequest->id, 'sender_id' => $sender->id]
        );

        return back()->with('success', 'Connection request accepted. The sender has been notified.');
    }

    public function decline($id)
    {
        $connectionRequest = ConnectionRequest::where('id', $id)
            ->where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->firstOrFail();

        $sender = $connectionRequest->sender;  // ← ADD THIS to get sender object

        $connectionRequest->update([
            'status' => 'declined',
        ]);

        // ✅ ADD THIS: Log friend request declined
        $this->logActivity(
            'friend_request_declined',
            $sender,
            'Declined friend request from ' . $sender->name,
            ['connection_request_id' => $connectionRequest->id, 'sender_id' => $sender->id]
        );

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

        // Get the friend being removed
        $friend = $connectionRequest->sender_id === $authUserId 
            ? $connectionRequest->receiver 
            : $connectionRequest->sender;

        $connectionRequest->delete();

        // ✅ ADD THIS: Log friend removed
        $this->logActivity(
            'friend_removed',
            $friend,
            'Removed ' . $friend->name . ' from friends',
            ['connection_request_id' => $id, 'friend_id' => $friend->id]
        );

        return back()->with('success', 'Friend removed successfully.');
    }
}