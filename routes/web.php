<?php

use App\Http\Controllers\ConnectionRequestController;
use App\Http\Controllers\FriendsController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserSearchController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\GroupController;

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

    // Comments
    Route::post('/posts/{postId}/comments', [CommentController::class, 'store'])
        ->name('comments.store');
    Route::delete('/comments/{id}', [CommentController::class, 'destroy'])
        ->name('comments.destroy');

    // Reactions
    Route::post('/posts/{postId}/reactions', [ReactionController::class, 'store'])
        ->name('reactions.store');
    Route::delete('/posts/{postId}/reactions', [ReactionController::class, 'destroy'])
        ->name('reactions.destroy');

    // Shares
    Route::post('/posts/{postId}/share', [ShareController::class, 'store'])
        ->name('shares.store');

    // Messages
    Route::get('/messages', [MessageController::class, 'index'])
        ->name('messages.index');
    Route::post('/messages', [MessageController::class, 'store'])
        ->name('messages.store');

    // Groups
    Route::get('/groups', [GroupController::class, 'index'])
        ->name('groups.index');
    Route::post('/groups', [GroupController::class, 'store'])
        ->name('groups.store');
    Route::post('/groups/{id}/join', [GroupController::class, 'join'])
        ->name('groups.join');
    Route::post('/groups/{id}/leave', [GroupController::class, 'leave'])
        ->name('groups.leave');
    Route::get('/groups/{id}/chat', [GroupController::class, 'chat'])
        ->name('groups.chat');
    Route::post('/groups/{id}/messages', [GroupController::class, 'sendMessage'])
        ->name('groups.messages.store');
});

require __DIR__.'/auth.php';
