<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\ActivityFeed;
use App\Models\Achievement;
use App\Models\UserAchievement;
use Illuminate\Http\Request;
use Carbon\Carbon;

class HabitController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $habits = Habit::where('user_id', $user->id)
            ->with(['logs' => function($q) {
                $q->where('completed_date', '>=', Carbon::today()->subDays(30));
            }])
            ->latest()
            ->get();

        return response()->json(['habits' => $habits]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'frequency' => 'nullable|in:daily,weekly',
            'target_days_per_week' => 'nullable|integer|min:1|max:7',
            'category' => 'nullable|string',
            'color' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        $habit = Habit::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'frequency' => $validated['frequency'] ?? 'daily',
            'target_days_per_week' => $validated['target_days_per_week'] ?? 7,
            'category' => $validated['category'] ?? 'General',
            'color' => $validated['color'] ?? '#ec4899',
            'icon' => $validated['icon'] ?? 'flame',
            'current_streak' => 0,
            'best_streak' => 0,
        ]);

        return response()->json(['habit' => $habit->load('logs')], 201);
    }

    public function toggleLog($id, Request $request)
    {
        $user = $request->user();
        $habit = Habit::where('user_id', $user->id)->where('id', $id)->firstOrFail();
        $date = $request->input('date', Carbon::today()->toDateString());

        $existing = HabitLog::where('habit_id', $habit->id)
            ->whereDate('completed_date', $date)
            ->first();

        if ($existing) {
            $existing->delete();
            $logged = false;
        } else {
            HabitLog::create([
                'habit_id' => $habit->id,
                'user_id' => $user->id,
                'completed_date' => $date,
            ]);
            $logged = true;

            // Activity feed
            ActivityFeed::create([
                'user_id' => $user->id,
                'type' => 'habit_completed',
                'content' => "completed habit: {$habit->title}",
                'meta' => ['habit_id' => $habit->id],
            ]);
        }

        // Recalculate streak for this habit
        $this->recalculateStreak($habit, $user);

        return response()->json([
            'logged' => $logged,
            'habit' => $habit->fresh(['logs']),
            'user' => $user->fresh(),
        ]);
    }

    private function recalculateStreak(Habit $habit, $user)
    {
        $logs = HabitLog::where('habit_id', $habit->id)
            ->orderBy('completed_date', 'desc')
            ->pluck('completed_date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->toArray();

        $streak = 0;
        $checkDate = Carbon::today();

        // If not logged today, check starting from yesterday
        if (!in_array($checkDate->toDateString(), $logs)) {
            $checkDate->subDay();
        }

        while (in_array($checkDate->toDateString(), $logs)) {
            $streak++;
            $checkDate->subDay();
        }

        $best = max($habit->best_streak, $streak);
        $habit->update(['current_streak' => $streak, 'best_streak' => $best]);

        // Update overall user max streak
        $maxUserStreak = Habit::where('user_id', $user->id)->max('current_streak') ?? 0;
        $user->update([
            'streak_count' => $maxUserStreak,
            'highest_streak' => max($user->highest_streak, $maxUserStreak),
        ]);

        // 7 Day Streak Achievement Check
        if ($maxUserStreak >= 7) {
            $streak7Ach = Achievement::where('code', 'streak_7')->first();
            if ($streak7Ach && !$user->achievements()->where('achievement_id', $streak7Ach->id)->exists()) {
                UserAchievement::create([
                    'user_id' => $user->id,
                    'achievement_id' => $streak7Ach->id,
                    'unlocked_at' => now(),
                ]);
                $user->increment('total_points', $streak7Ach->points);
            }
        }
    }

    public function destroy($id, Request $request)
    {
        $habit = Habit::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();
        $habit->delete();

        return response()->json(['message' => 'Habit deleted successfully']);
    }
}
