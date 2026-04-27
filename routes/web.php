<?php

use App\Http\Controllers\BlockReportController;
use App\Http\Controllers\ConnectionRequestController;
use App\Http\Controllers\FriendsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\UserSearchController;
use App\Http\Controllers\ActivityController;
use Illuminate\Support\Facades\Auth;  // ← ADD THIS

// Main branch extra features
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\AiMatchController;

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

    // ================= PROFILE =================
    // SPECIFIC routes FIRST (must come before wildcard routes)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/profile/activities', [ActivityController::class, 'index'])->name('profile.activities');
    Route::match(['put', 'patch', 'post'], '/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // WILDCARD route LAST (catches /profile/{id})
    Route::get('/profile/{id}', [ProfileController::class, 'show'])->name('profile.show');

    // ================= POSTS =================
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);

    // ================= CONNECTION REQUESTS =================
    Route::post('/connection-requests', [ConnectionRequestController::class, 'store'])->name('connection-requests.store');
    Route::post('/connection-requests/{id}/accept', [ConnectionRequestController::class, 'accept'])->name('connection-requests.accept');
    Route::post('/connection-requests/{id}/decline', [ConnectionRequestController::class, 'decline'])->name('connection-requests.decline');

    // ================= FRIENDS =================
    Route::get('/friends', [FriendsController::class, 'index'])->name('friends.index');
    Route::delete('/friends/{id}', [ConnectionRequestController::class, 'removeFriend'])->name('friends.remove');

    // ================= SAFETY (Block + Report) =================
    Route::get('/reports', [BlockReportController::class, 'index'])->name('reports.index');
    Route::post('/blocks', [BlockReportController::class, 'blockUser'])->name('blocks.store');
    Route::delete('/blocks/{user}', [BlockReportController::class, 'unblockUser'])->name('blocks.destroy');
    Route::post('/reports', [BlockReportController::class, 'storeReport'])->name('reports.store');

    // ================= SUBSCRIPTIONS + PAYMENT =================
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::post('/subscriptions/{plan}/checkout', [PaymentController::class, 'checkout'])->name('payments.checkout');
    Route::get('/payments/{payment}/redirect', [PaymentController::class, 'redirectToGateway'])->name('payments.redirect');

    // Demo payment routes
    Route::get('/payments/{payment}/demo-success', [PaymentController::class, 'demoSuccess'])->name('payments.demo-success');
    Route::get('/payments/{payment}/demo-fail', [PaymentController::class, 'demoFail'])->name('payments.demo-fail');
    Route::get('/payments/{payment}/demo-cancel', [PaymentController::class, 'demoCancel'])->name('payments.demo-cancel');

    // ================= NOTIFICATIONS =================
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // ================= COMMENTS =================
    Route::post('/posts/{postId}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::delete('/comments/{id}', [CommentController::class, 'destroy'])->name('comments.destroy');

    // ================= REACTIONS =================
    Route::post('/posts/{postId}/reactions', [ReactionController::class, 'store'])->name('reactions.store');
    Route::delete('/posts/{postId}/reactions', [ReactionController::class, 'destroy'])->name('reactions.destroy');

    // ================= SHARES =================
    Route::post('/posts/{postId}/share', [ShareController::class, 'store'])->name('shares.store');

    // ================= MESSAGES =================
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');

    // ================= GROUPS =================
    Route::get('/groups', [GroupController::class, 'index'])->name('groups.index');
    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::post('/groups/{id}/join', [GroupController::class, 'join'])->name('groups.join');
    Route::post('/groups/{id}/leave', [GroupController::class, 'leave'])->name('groups.leave');
    Route::get('/groups/{id}/chat', [GroupController::class, 'chat'])->name('groups.chat');
    Route::post('/groups/{id}/messages', [GroupController::class, 'sendMessage'])->name('groups.messages.store');
    Route::post('/groups/{id}/add-member', [GroupController::class, 'addMember'])->name('groups.addMember');
    Route::delete('/groups/{id}/remove-member/{userId}', [GroupController::class, 'removeMember'])->name('groups.removeMember');

    // ================= AI MATCH =================
    Route::get('/ai-match', [AiMatchController::class, 'index'])->name('ai.match');
    Route::post('/ai-match', [AiMatchController::class, 'match'])->name('ai.match.post');
});

// ================= PAYMENT CALLBACKS (outside auth) =================
Route::match(['get', 'post'], '/payments/success', [PaymentController::class, 'success'])->name('payments.success');
Route::match(['get', 'post'], '/payments/fail', [PaymentController::class, 'fail'])->name('payments.fail');
Route::match(['get', 'post'], '/payments/cancel', [PaymentController::class, 'cancel'])->name('payments.cancel');
Route::match(['get', 'post'], '/payments/ipn', [PaymentController::class, 'ipn'])->name('payments.ipn');

// ================= TEST ROUTE (DEBUG ONLY - REMOVE AFTER TESTING) =================
Route::get('/test-user', function () {
    $user = Auth::user();
    if (!$user) {
        return 'Please login first';
    }
    
    return [
        'id' => $user->id,
        'email' => $user->email,
        'is_premium' => $user->is_premium,
        'daily_searches' => $user->daily_searches,
        'last_search_date' => $user->last_search_date,
        'today' => date('Y-m-d'),
        'can_search' => !$user->is_premium && ($user->daily_searches ?? 0) >= 3 ? 'BLOCKED' : 'ALLOWED',
    ];
})->middleware('auth');

require __DIR__.'/auth.php';