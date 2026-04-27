<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserBlock;
use App\Models\Report;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BlockReportController extends Controller
{
    use LogsActivity;

    /**
     * Display safety center (reports and blocks)
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get users that current user has blocked
        $blockedUsers = UserBlock::where('blocker_id', $user->id)
            ->with('blockedUser')
            ->get()
            ->pluck('blockedUser');
        
        // Get reports made by current user
        $reports = Report::where('reporter_id', $user->id)
            ->with('reportedUser')
            ->latest()
            ->get();
        
        return Inertia::render('Reports', [
            'blockedUsers' => $blockedUsers,
            'reports' => $reports,
        ]);
    }

    /**
     * Block a user
     */
    public function blockUser(Request $request)
    {
        $request->validate([
            'blocked_user_id' => ['required', 'exists:users,id'],
        ]);

        $blockerId = Auth::id();
        $blockedUserId = $request->blocked_user_id;

        if ($blockerId == $blockedUserId) {
            return back()->with('error', 'You cannot block yourself.');
        }

        // Check if already blocked
        $alreadyBlocked = UserBlock::where('blocker_id', $blockerId)
            ->where('blocked_user_id', $blockedUserId)
            ->exists();

        if ($alreadyBlocked) {
            return back()->with('error', 'User already blocked.');
        }

        // Create block
        UserBlock::create([
            'blocker_id' => $blockerId,
            'blocked_user_id' => $blockedUserId,
        ]);

        // Log activity
        $blockedUser = User::find($blockedUserId);
        $this->logActivity(
            'user_blocked',
            $blockedUser,
            'Blocked user: ' . $blockedUser->name,
            ['blocked_user_id' => $blockedUserId]
        );

        return back()->with('success', 'User blocked successfully.');
    }

    /**
     * Unblock a user
     */
    public function unblockUser($userId)
    {
        $blockerId = Auth::id();

        $block = UserBlock::where('blocker_id', $blockerId)
            ->where('blocked_user_id', $userId)
            ->firstOrFail();

        $blockedUser = User::find($userId);
        
        $block->delete();

        // Log activity
        $this->logActivity(
            'user_unblocked',
            $blockedUser,
            'Unblocked user: ' . $blockedUser->name,
            ['unblocked_user_id' => $userId]
        );

        return back()->with('success', 'User unblocked successfully.');
    }

    /**
     * Report a user
     */
    public function storeReport(Request $request)
    {
        $request->validate([
            'reported_user_id' => ['required', 'exists:users,id'],
            'reason' => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $reporterId = Auth::id();
        $reportedUserId = $request->reported_user_id;

        if ($reporterId == $reportedUserId) {
            return back()->with('error', 'You cannot report yourself.');
        }

        // Check if already reported
        $alreadyReported = Report::where('reporter_id', $reporterId)
            ->where('reported_user_id', $reportedUserId)
            ->exists();

        if ($alreadyReported) {
            return back()->with('error', 'You have already reported this user.');
        }

        // Create report
        Report::create([
            'reporter_id' => $reporterId,
            'reported_user_id' => $reportedUserId,
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        // Log activity
        $reportedUser = User::find($reportedUserId);
        $this->logActivity(
            'user_reported',
            $reportedUser,
            'Reported user: ' . $reportedUser->name . ' (Reason: ' . $request->reason . ')',
            ['reported_user_id' => $reportedUserId, 'reason' => $request->reason]
        );

        return back()->with('success', 'User reported successfully. Our team will review the report.');
    }
}