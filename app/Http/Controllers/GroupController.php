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

        $messages = Message::where('group_id', $id)
            ->with('sender')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('GroupChat', [
            'group' => $group,
            'messages' => $messages,
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
}