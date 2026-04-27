<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'personality',
        'purpose',
        'communication_style',
        'group_type',
        'group_size',
        'bio',
        'ideal_person',
        'ideal_person_description',
        'dislike_type',
        'location',
        'interests',
        'profile_photo_path',
        'privacy_show_email',
        'privacy_show_location',
        'daily_searches',
        'last_search_date',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'purpose' => 'array',
        'group_type' => 'array',
        'interests' => 'array',
        'privacy_show_email' => 'boolean',
        'privacy_show_location' => 'boolean',
        'last_search_date' => 'date',
    ];

    /**
     * Get the profile photo URL attribute
     */
    public function getProfilePhotoUrlAttribute()
    {
        if ($this->profile_photo_path && Storage::disk('public')->exists($this->profile_photo_path)) {
            return asset('storage/' . $this->profile_photo_path);
        }
        
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=6366f1&color=fff';
    }

    // ================= RELATIONSHIPS =================
    
    public function sentConnectionRequests()
    {
        return $this->hasMany(ConnectionRequest::class, 'sender_id');
    }

    public function receivedConnectionRequests()
    {
        return $this->hasMany(ConnectionRequest::class, 'receiver_id');
    }

    public function blocksCreated()
    {
        return $this->hasMany(UserBlock::class, 'blocker_id');
    }

    public function blocksReceived()
    {
        return $this->hasMany(UserBlock::class, 'blocked_user_id');
    }

    public function reportsCreated()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get active subscription (not expired)
     */
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ends_at')
                      ->orWhere('ends_at', '>', now());
            })
            ->latest();
    }

    // Relationship for activities
    public function activities()
    {
        return $this->hasMany(UserActivity::class)->latest();
    }

    // ================= AI SEARCH HELPER METHODS =================
    
    /**
     * Check if user can perform an AI search
     */
    public function canPerformAISearch()
    {
        // Premium users have unlimited searches
        if ($this->is_premium) {
            return true;
        }
        
        // Reset counter if it's a new day
        if ($this->last_search_date != today()) {
            $this->daily_searches = 0;
            $this->last_search_date = today();
            $this->save();
        }
        
        // Free users: 3 searches per day
        return $this->daily_searches < 3;
    }
    
    /**
     * Increment the search count for user
     */
    public function incrementSearchCount()
    {
        if (!$this->is_premium) {
            // Reset if new day
            if ($this->last_search_date != today()) {
                $this->daily_searches = 0;
                $this->last_search_date = today();
            }
            
            $this->daily_searches++;
            $this->save();
        }
    }
    
    /**
     * Get remaining searches for today
     */
    public function getRemainingSearchesAttribute()
    {
        if ($this->is_premium) {
            return 'Unlimited';
        }
        
        // Reset if new day
        if ($this->last_search_date != today()) {
            return 3;
        }
        
        return max(0, 3 - ($this->daily_searches ?? 0));
    }
    
    /**
     * Get remaining searches as integer
     */
    public function getRemainingSearchesIntAttribute()
    {
        if ($this->is_premium) {
            return 9999;
        }
        
        if ($this->last_search_date != today()) {
            return 3;
        }
        
        return max(0, 3 - ($this->daily_searches ?? 0));
    }

    // ================= HELPER METHODS =================
    
    /**
     * Check if user has an active premium subscription
     */
    public function getIsPremiumAttribute()
    {
        $subscription = $this->activeSubscription;
        return $subscription !== null && $subscription->exists();
    }

    /**
     * Get user's profile completion percentage
     */
    public function getProfileCompletionAttribute()
    {
        $fields = ['bio', 'location', 'personality', 'purpose', 'interests'];
        $filled = 0;
        
        foreach ($fields as $field) {
            if (!empty($this->$field)) {
                $filled++;
            }
        }
        
        return round(($filled / count($fields)) * 100);
    }
}