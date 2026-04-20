<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

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
        'dislike_type',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'purpose' => 'array',
            'group_type' => 'array',
        ];
    }

    public function sentConnectionRequests()
    {
        return $this->hasMany(ConnectionRequest::class, 'sender_id');
    }

    public function receivedConnectionRequests()
    {
        return $this->hasMany(ConnectionRequest::class, 'receiver_id');
    }
}
