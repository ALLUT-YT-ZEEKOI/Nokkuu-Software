<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Goal;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\ActivityFeed;
use App\Models\Friend;
use App\Models\Expense;
use App\Models\Credit;
use App\Models\BuyingItem;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        // Today's tasks (owned or assigned to user)
        $todayTasks = Task::where('user_id', $user->id)
            ->where(function($query) use ($today) {
                $query->whereNull('due_date')
                      ->orWhereDate('due_date', '<=', $today);
            })
            ->with(['assignedBy', 'goal'])
            ->get();

        $totalTodayTasks = $todayTasks->count();
        $completedTodayTasks = $todayTasks->where('status', 'completed')->count();
        $pendingTodayTasks = $totalTodayTasks - $completedTodayTasks;
        $todayTaskCompletionRate = $totalTodayTasks > 0 ? round(($completedTodayTasks / $totalTodayTasks) * 100) : 0;

        // Financial & Buying Prices Breakdown
        $todayExpenseTotal = Expense::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->sum('amount');

        $pendingBuyingItems = BuyingItem::where('user_id', $user->id)
            ->where('status', '!=', 'bought')
            ->get();
        $pendingBuyingPriceTotal = $pendingBuyingItems->sum('estimated_price');

        $pendingCreditsToReceive = Credit::where('user_id', $user->id)
            ->where('type', 'receive')
            ->where('status', 'pending')
            ->sum('amount');

        $pendingCreditsToPay = Credit::where('user_id', $user->id)
            ->where('type', 'give')
            ->where('status', 'pending')
            ->sum('amount');

        // Goals progress overview
        $goals = Goal::where('user_id', $user->id)->with('milestones')->get();
        $totalGoals = $goals->count();
        $completedGoals = $goals->where('status', 'completed')->count();
        $overallGoalProgress = $totalGoals > 0 ? round($goals->avg('progress_percentage')) : 0;

        // Habits & Today check-ins
        $habits = Habit::where('user_id', $user->id)->with(['logs' => function($q) use ($today) {
            $q->whereDate('completed_date', $today);
        }])->get();

        $completedHabitsCount = $habits->filter(fn($h) => $h->logs->count() > 0)->count();

        // Assigned Tasks Overview (Tasks assigned BY user to friends & assigned TO user by friends)
        $assignedToFriends = Task::where('assigned_by_id', $user->id)
            ->with(['user', 'goal'])
            ->get();

        $assignedByFriends = Task::where('user_id', $user->id)
            ->whereNotNull('assigned_by_id')
            ->with(['assignedBy', 'goal'])
            ->get();

        // Friend activity feed (activities from friends)
        $friendIds = Friend::where(function($q) use ($user) {
            $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
        })->where('status', 'accepted')
        ->get()
        ->map(fn($f) => $f->user_id == $user->id ? $f->friend_id : $f->user_id);

        $friendActivities = ActivityFeed::whereIn('user_id', $friendIds)
            ->orWhere('user_id', $user->id)
            ->with('user')
            ->latest()
            ->take(10)
            ->get();

        // Weekly completed tasks stats (last 7 days)
        $weeklyStats = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();
            $dayName = Carbon::today()->subDays($i)->format('D');
            $count = Task::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereDate('completed_at', $date)
                ->count();
            $weeklyStats[] = [
                'day' => $dayName,
                'date' => $date,
                'completed' => $count,
            ];
        }

        return response()->json([
            'user' => $user,
            'today_tasks' => $todayTasks,
            'tasks_summary' => [
                'total_today' => $totalTodayTasks,
                'completed_today' => $completedTodayTasks,
                'pending_today' => $pendingTodayTasks,
                'today_completion_rate' => $todayTaskCompletionRate,
            ],
            'finance_summary' => [
                'today_expense_total' => (float)$todayExpenseTotal,
                'pending_buying_price_total' => (float)$pendingBuyingPriceTotal,
                'pending_buying_count' => $pendingBuyingItems->count(),
                'pending_credits_to_receive' => (float)$pendingCreditsToReceive,
                'pending_credits_to_pay' => (float)$pendingCreditsToPay,
            ],
            'goals_summary' => [
                'total' => $totalGoals,
                'completed' => $completedGoals,
                'overall_progress' => $overallGoalProgress,
                'goals' => $goals,
            ],
            'habits_summary' => [
                'total' => $habits->count(),
                'completed_today' => $completedHabitsCount,
                'streak' => $user->streak_count,
                'habits' => $habits,
            ],
            'assigned_to_friends' => $assignedToFriends,
            'assigned_by_friends' => $assignedByFriends,
            'friend_activities' => $friendActivities,
            'weekly_stats' => $weeklyStats,
        ]);
    }
}

