<?php

namespace App\Traits;

use App\Http\Controllers\ActivityController;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Log user activity
     * 
     * @param string $actionType
     * @param mixed $target
     * @param string|null $description
     * @param array $metadata
     * @return void
     */
    protected function logActivity(string $actionType, $target = null, ?string $description = null, array $metadata = [])
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        
        if ($user && $user->id) {
            ActivityController::log($user->id, $actionType, $target, $description, $metadata);
        }
    }
}