<?php

namespace App\Http\Controllers;

use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }
        
        $query = UserActivity::where('user_id', $user->id);
        
        // Apply filters
        if ($request->filled('action_type') && $request->action_type !== 'all') {
            $query->where('action_type', $request->action_type);
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('target_name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }
        
        $activities = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();
        
        // Add icon to each activity
        $activities->getCollection()->transform(function ($activity) {
            $activity->icon = $this->getActivityIcon($activity->action_type);
            return $activity;
        });
        
        // Get activity statistics
        $stats = [
            'total' => UserActivity::where('user_id', $user->id)->count(),
            'by_type' => UserActivity::where('user_id', $user->id)
                ->selectRaw('action_type, count(*) as count')
                ->groupBy('action_type')
                ->pluck('count', 'action_type'),
            'this_week' => UserActivity::where('user_id', $user->id)
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];
        
        // Get all action types for filter dropdown
        $actionTypes = UserActivity::where('user_id', $user->id)
            ->distinct()
            ->pluck('action_type');
        
        // ✅ FIXED: Added 'auth' prop with user
        return Inertia::render('Profile/ActivityTracker', [
            'auth' => ['user' => $user],  // ← THIS WAS MISSING!
            'activities' => $activities,
            'stats' => $stats,
            'actionTypes' => $actionTypes,
            'filters' => $request->only(['action_type', 'date_from', 'date_to', 'search']),
        ]);
    }
    
    private function getActivityIcon($actionType)
    {
        return match($actionType) {
            'post_reaction' => '👍',
            'comment' => '💬',
            'friend_request_sent' => '📨',
            'friend_request_accepted' => '✅',
            'friend_request_declined' => '❌',
            'profile_view' => '👁️',
            'group_join' => '👥',
            'post_created' => '📝',
            'post_shared' => '🔄',
            'profile_updated' => '✏️',
            default => '📌',
        };
    }
    
    /**
     * Helper method to log activities (called from other controllers)
     */
    public static function log($userId, $actionType, $target = null, $description = null, $metadata = [])
    {
        $data = [
            'user_id' => $userId,
            'action_type' => $actionType,
            'description' => $description,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ];
        
        if ($target) {
            $data['target_type'] = get_class($target);
            $data['target_id'] = $target->id;
            if (method_exists($target, 'name')) {
                $data['target_name'] = $target->name;
            } elseif (method_exists($target, 'title')) {
                $data['target_name'] = $target->title;
            }
        }
        
        return UserActivity::create($data);
    }
}