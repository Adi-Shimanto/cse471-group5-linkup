<?php

use App\Http\Controllers\ConnectionRequestController;
use App\Http\Controllers\FriendsController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserSearchController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [UserSearchController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);

    Route::post('/connection-requests', [ConnectionRequestController::class, 'store'])
        ->name('connection-requests.store');

    Route::post('/connection-requests/{id}/accept', [ConnectionRequestController::class, 'accept'])
        ->name('connection-requests.accept');

    Route::post('/connection-requests/{id}/decline', [ConnectionRequestController::class, 'decline'])
        ->name('connection-requests.decline');

    Route::get('/friends', [FriendsController::class, 'index'])
        ->name('friends.index');

    Route::delete('/friends/{id}', [ConnectionRequestController::class, 'removeFriend'])
        ->name('friends.remove');
});

require __DIR__.'/auth.php';
