<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action_type',
        'target_type',
        'target_id',
        'target_name',
        'description',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function target()
    {
        if ($this->target_type && $this->target_id) {
            return $this->morphTo();
        }
        return null;
    }

    // Scopes for filtering
    public function scopeOfType($query, $type)
    {
        if ($type && $type !== 'all') {
            return $query->where('action_type', $type);
        }
        return $query;
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }
        return $query;
    }

    // Helper to get icon for activity type
    public function getIconAttribute()
    {
        return match($this->action_type) {
            'post_reaction' => '👍',
            'comment' => '💬',
            'friend_request_sent' => '📨',
            'friend_request_accepted' => '✅',
            'friend_request_declined' => '❌',
            'profile_view' => '👁️',
            'group_join' => '👥',
            'post_created' => '📝',
            'post_shared' => '🔄',
            default => '📌',
        };
    }

    // Helper to get color for activity type
    public function getColorAttribute()
    {
        return match($this->action_type) {
            'post_reaction' => 'blue',
            'comment' => 'green',
            'friend_request_sent' => 'yellow',
            'friend_request_accepted' => 'green',
            'friend_request_declined' => 'red',
            'profile_view' => 'gray',
            'group_join' => 'purple',
            'post_created' => 'indigo',
            'post_shared' => 'orange',
            default => 'gray',
        };
    }
}