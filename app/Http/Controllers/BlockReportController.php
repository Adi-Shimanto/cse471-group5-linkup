<?php

namespace App\Http\Controllers;

use App\Models\ConnectionRequest;
use App\Models\Report;
use App\Models\User;
use App\Models\UserBlock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BlockReportController extends Controller
{
    public function index(Request $request): Response
    {
        $authUserId = $request->user()->id;

        $blockedUsers = UserBlock::with('blockedUser:id,name,email')
            ->where('blocker_id', $authUserId)
            ->latest()
            ->get()
            ->map(function (UserBlock $block) {
                return [
                    'id' => $block->id,
                    'blocked_user_id' => $block->blocked_user_id,
                    'name' => $block->blockedUser?->name,
                    'email' => $block->blockedUser?->email,
                    'created_at' => $block->created_at?->toDateTimeString(),
                ];
            });

        $reports = Report::with(['reportedUser:id,name,email'])
            ->where('reporter_id', $authUserId)
            ->latest()
            ->get()
            ->map(function (Report $report) {
                return [
                    'id' => $report->id,
                    'target' => $report->reportedUser
                        ? $report->reportedUser->name.' (User)'
                        : ($report->reported_group_name ? $report->reported_group_name.' (Group)' : 'Unknown'),
                    'reason' => $report->reason,
                    'description' => $report->description,
                    'status' => $report->status,
                    'created_at' => $report->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('Reports', [
            'blockedUsers' => $blockedUsers,
            'reports' => $reports,
        ]);
    }

    public function blockUser(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'blocked_user_id' => ['required', 'exists:users,id'],
        ]);

        $blockerId = Auth::id();
        $blockedUserId = (int) $validated['blocked_user_id'];

        if ($blockerId === $blockedUserId) {
            return back()->with('error', 'You cannot block yourself.');
        }

        UserBlock::firstOrCreate([
            'blocker_id' => $blockerId,
            'blocked_user_id' => $blockedUserId,
        ]);

        ConnectionRequest::where(function ($query) use ($blockerId, $blockedUserId) {
            $query->where('sender_id', $blockerId)->where('receiver_id', $blockedUserId);
        })->orWhere(function ($query) use ($blockerId, $blockedUserId) {
            $query->where('sender_id', $blockedUserId)->where('receiver_id', $blockerId);
        })->delete();

        return back()->with('success', 'User blocked successfully. Existing connection removed.');
    }

    public function unblockUser(Request $request, User $user): RedirectResponse
    {
        UserBlock::where('blocker_id', $request->user()->id)
            ->where('blocked_user_id', $user->id)
            ->delete();

        return back()->with('success', 'User unblocked successfully.');
    }

    public function storeReport(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reported_user_id' => ['nullable', 'exists:users,id'],
            'reported_group_name' => ['nullable', 'string', 'max:255'],
            'reason' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        if (empty($validated['reported_user_id']) && empty($validated['reported_group_name'])) {
            return back()->with('error', 'Please choose a user or provide a group name for the report.');
        }

        Report::create([
            'reporter_id' => $request->user()->id,
            'reported_user_id' => $validated['reported_user_id'] ?? null,
            'reported_group_name' => $validated['reported_group_name'] ?? null,
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Report submitted successfully for admin review.');
    }
}
