<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Goal;
use App\Models\GoalMilestone;
use App\Models\Task;
use App\Models\TaskSubtask;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\Friend;
use App\Models\Challenge;
use App\Models\ChallengeParticipant;
use App\Models\Achievement;
use App\Models\UserAchievement;
use App\Models\UplyNotification;
use App\Models\ActivityFeed;
use App\Models\Expense;
use App\Models\Note;
use App\Models\Credit;
use App\Models\BuyingItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Achievements
        $achievements = [
            [
                'code' => 'first_goal',
                'name' => 'First Goal Setter',
                'description' => 'Created your very first growth goal on Uply.',
                'icon' => 'target',
                'badge_color' => '#6366f1',
                'points' => 100,
            ],
            [
                'code' => 'streak_7',
                'name' => '7-Day Streak Flame',
                'description' => 'Maintained a daily habit streak for 7 consecutive days.',
                'icon' => 'flame',
                'badge_color' => '#f59e0b',
                'points' => 250,
            ],
            [
                'code' => 'tasks_100',
                'name' => 'Task Master 100',
                'description' => 'Crushed 100 tasks on your journey to growth.',
                'icon' => 'check-circle-2',
                'badge_color' => '#10b981',
                'points' => 500,
            ],
            [
                'code' => 'first_challenge',
                'name' => 'Challenger Pioneer',
                'description' => 'Joined or created your first accountability group challenge.',
                'icon' => 'trophy',
                'badge_color' => '#8b5cf6',
                'points' => 200,
            ],
            [
                'code' => 'helped_friend',
                'name' => 'Growth Buddy',
                'description' => 'Assigned or completed an accountability task for a friend.',
                'icon' => 'users',
                'badge_color' => '#ec4899',
                'points' => 300,
            ],
        ];

        foreach ($achievements as $ach) {
            Achievement::updateOrCreate(['code' => $ach['code']], $ach);
        }
    }
}
