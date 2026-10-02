<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\HabitController;
use App\Http\Controllers\Api\FriendController;
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\CreditController;
use App\Http\Controllers\Api\BuyingItemController;

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected API Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Goals
    Route::get('/goals', [GoalController::class, 'index']);
    Route::post('/goals', [GoalController::class, 'store']);
    Route::get('/goals/{id}', [GoalController::class, 'show']);
    Route::put('/goals/{id}', [GoalController::class, 'update']);
    Route::delete('/goals/{id}', [GoalController::class, 'destroy']);
    Route::post('/goals/{goalId}/milestones', [GoalController::class, 'addMilestone']);
    Route::post('/goals/{goalId}/milestones/{milestoneId}/toggle', [GoalController::class, 'toggleMilestone']);

    // Tasks
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/assigned-tasks', [TaskController::class, 'assignedTasksHub']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
    Route::post('/tasks/{taskId}/subtasks/{subtaskId}/toggle', [TaskController::class, 'toggleSubtask']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

    // Expenses
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

    // Credits & Cash Received
    Route::get('/credits', [CreditController::class, 'index']);
    Route::post('/credits', [CreditController::class, 'store']);
    Route::delete('/credits/{id}', [CreditController::class, 'destroy']);

    // Buying Wishlist & Items
    Route::get('/buying-items', [BuyingItemController::class, 'index']);
    Route::post('/buying-items', [BuyingItemController::class, 'store']);
    Route::put('/buying-items/{id}', [BuyingItemController::class, 'update']);
    Route::post('/buying-items/{id}/buy', [BuyingItemController::class, 'markPurchased']);
    Route::delete('/buying-items/{id}', [BuyingItemController::class, 'destroy']);

    // Notes / Tote Pad
    Route::get('/notes', [NoteController::class, 'index']);
    Route::post('/notes', [NoteController::class, 'store']);
    Route::put('/notes/{id}', [NoteController::class, 'update']);
    Route::post('/notes/{id}/pin', [NoteController::class, 'togglePin']);
    Route::delete('/notes/{id}', [NoteController::class, 'destroy']);

    // Habits
    Route::get('/habits', [HabitController::class, 'index']);
    Route::post('/habits', [HabitController::class, 'store']);
    Route::post('/habits/{id}/toggle', [HabitController::class, 'toggleLog']);
    Route::delete('/habits/{id}', [HabitController::class, 'destroy']);

    // Friends
    Route::get('/friends', [FriendController::class, 'index']);
    Route::get('/friends/search', [FriendController::class, 'search']);
    Route::post('/friends/request', [FriendController::class, 'sendRequest']);
    Route::post('/friends/request/{id}/respond', [FriendController::class, 'respondRequest']);
    Route::get('/friends/{id}', [FriendController::class, 'show']);

    // Challenges
    Route::get('/challenges', [ChallengeController::class, 'index']);
    Route::post('/challenges', [ChallengeController::class, 'store']);
    Route::get('/challenges/{id}', [ChallengeController::class, 'show']);
    Route::post('/challenges/{id}/join', [ChallengeController::class, 'join']);
    Route::put('/challenges/{id}/progress', [ChallengeController::class, 'updateProgress']);

    // Achievements
    Route::get('/achievements', [AchievementController::class, 'index']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});
