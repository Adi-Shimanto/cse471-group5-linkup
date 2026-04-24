<?php
namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MessageController extends Controller
{
    // Show private chat page with a specific user
    public function index(Request $request)
    {
        $friends = \App\Models\ConnectionRequest::where('status', 'accepted')
            ->where(function ($q) {
                $q->where('sender_id', Auth::id())
                  ->orWhere('receiver_id', Auth::id());
            })
            ->get()
            ->map(function ($conn) {
                $friend = $conn->sender_id === Auth::id()
                    ? $conn->receiver
                    : $conn->sender;
                return $friend;
            });

        $selectedUserId = $request->query('user');
        $messages = [];

        if ($selectedUserId) {
            $messages = Message::where(function ($q) use ($selectedUserId) {
                $q->where('sender_id', Auth::id())
                  ->where('receiver_id', $selectedUserId);
            })->orWhere(function ($q) use ($selectedUserId) {
                $q->where('sender_id', $selectedUserId)
                  ->where('receiver_id', Auth::id());
            })
            ->with('sender')
            ->orderBy('created_at')
            ->get();
        }

        return Inertia::render('Messages', [
            'friends' => $friends,
            'messages' => $messages,
            'selectedUserId' => $selectedUserId ? (int)$selectedUserId : null,
        ]);
    }

    // Send a private message
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
            'content' => ['nullable', 'string', 'max:1000'],
            'file' => ['nullable', 'file', 'max:5120'],
        ]);

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store('messages', 'public');
        }

        Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'content' => $request->content,
            'file_path' => $filePath,
            'file_name' => $fileName,
        ]);

        return back()->with('success', 'Message sent.');
    }
}