<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Mass assignable fields
     */
    protected $fillable = [
        // BASIC INFO
        'name',
        'email',
        'password',

        // 🧠 INDIVIDUAL PREFERENCES
        'personality',
        'purpose',
        'communication_style',

        // 👥 GROUP PREFERENCES
        'group_type',
        'group_size',

        // 🤖 AI PROFILE
        'bio',
        'ideal_person',
        'dislike_type',
    ];

    /**
     * Hidden fields
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',

            // password auto-hash (Laravel 10+ feature)
            'password' => 'hashed',

            // JSON fields → arrays in PHP
            'purpose' => 'array',
            'group_type' => 'array',
        ];
    }
}