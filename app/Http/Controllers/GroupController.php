<?php
namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupMember;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GroupController extends Controller
{
    // Show all groups
    public function index()
    {
        $groups = Group::with('creator')
            ->withCount('members')
            ->get()
            ->map(function ($group) {
                $group->is_member = $group->members()
                    ->where('user_id', Auth::id())
                    ->exists();
                return $group;
            });

        return Inertia::render('Groups', [
            'groups' => $groups,
        ]);
    }

    // Create a new group
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $group = Group::create([
            'name' => $request->name,
            'description' => $request->description,
            'created_by' => Auth::id(),
        ]);

        // Add creator as admin member
        GroupMember::create([
            'group_id' => $group->id,
            'user_id' => Auth::id(),
            'role' => 'admin',
        ]);

        return back()->with('success', 'Group created!');
    }

    // Join a group
    public function join($id)
    {
        $alreadyMember = GroupMember::where('group_id', $id)
            ->where('user_id', Auth::id())
            ->exists();

        if (!$alreadyMember) {
            GroupMember::create([
                'group_id' => $id,
                'user_id' => Auth::id(),
                'role' => 'member',
            ]);
        }

        return back()->with('success', 'Joined group!');
    }

    // Leave a group
    public function leave($id)
    {
        GroupMember::where('group_id', $id)
            ->where('user_id', Auth::id())
            ->delete();

        return back()->with('success', 'Left group.');
    }

    // Show group chat
    public function chat($id)
    {
        $group = Group::with('members.user')->findOrFail($id);

        $isMember = $group->members()
            ->where('user_id', Auth::id())
            ->exists();

        if (!$isMember) {
            return redirect()->route('groups.index')
                ->with('error', 'You must join the group first.');
        }

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

        $messages = Message::where('group_id', $id)
            ->with('sender')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('GroupChat', [
            'group' => $group,
            'messages' => $messages,
            'friends' => $friends,
        ]);
    }

    // Send message in group
    public function sendMessage(Request $request, $id)
    {
        $request->validate([
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
            'group_id' => $id,
            'content' => $request->content,
            'file_path' => $filePath,
            'file_name' => $fileName,
        ]);

        return back()->with('success', 'Message sent.');
    }

    // Add member to group
    public function addMember(Request $request, $id)
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $group = Group::findOrFail($id);

        // Check if requester is admin
        $isAdmin = GroupMember::where('group_id', $id)
            ->where('user_id', Auth::id())
            ->where('role', 'admin')
            ->exists();

        if (!$isAdmin) {
            return back()->with('error', 'Only admin can add members.');
        }

        // Check if already a member
        $alreadyMember = GroupMember::where('group_id', $id)
            ->where('user_id', $request->user_id)
            ->exists();

        if ($alreadyMember) {
            return back()->with('error', 'User is already a member.');
        }

        GroupMember::create([
            'group_id' => $id,
            'user_id' => $request->user_id,
            'role' => 'member',
        ]);

        return back()->with('success', 'Member added successfully!');
    }
}