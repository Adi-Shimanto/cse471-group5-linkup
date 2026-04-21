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

    Route::get('/reports', [BlockReportController::class, 'index'])->name('reports.index');
    Route::post('/blocks', [BlockReportController::class, 'blockUser'])->name('blocks.store');
    Route::delete('/blocks/{user}', [BlockReportController::class, 'unblockUser'])->name('blocks.destroy');
    Route::post('/reports', [BlockReportController::class, 'storeReport'])->name('reports.store');

    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::post('/subscriptions/{plan}/checkout', [PaymentController::class, 'checkout'])->name('payments.checkout');
    Route::get('/payments/{payment}/redirect', [PaymentController::class, 'redirectToGateway'])->name('payments.redirect');
    Route::get('/payments/{payment}/demo-success', [PaymentController::class, 'demoSuccess'])->name('payments.demo-success');
    Route::get('/payments/{payment}/demo-fail', [PaymentController::class, 'demoFail'])->name('payments.demo-fail');
    Route::get('/payments/{payment}/demo-cancel', [PaymentController::class, 'demoCancel'])->name('payments.demo-cancel');

    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});

Route::match(['get', 'post'], '/payments/success', [PaymentController::class, 'success'])->name('payments.success');
Route::match(['get', 'post'], '/payments/fail', [PaymentController::class, 'fail'])->name('payments.fail');
Route::match(['get', 'post'], '/payments/cancel', [PaymentController::class, 'cancel'])->name('payments.cancel');
Route::match(['get', 'post'], '/payments/ipn', [PaymentController::class, 'ipn'])->name('payments.ipn');

require __DIR__.'/auth.php';
