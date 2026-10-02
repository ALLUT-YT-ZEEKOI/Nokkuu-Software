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

        // 2. Demo Users
        $ameen = User::create([
            'name' => 'Ameen',
            'email' => 'ameen@gmail.com',
            'password' => Hash::make('ameen@gmail.com'),
            'bio' => 'Building cool full-stack projects & pushing daily code habits 🚀',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'streak_count' => 7,
            'highest_streak' => 14,
            'tasks_completed' => 28,
            'total_points' => 850,
            'level' => 3,
            'title' => 'Productivity Architect',
        ]);

        $rahul = User::create([
            'name' => 'Rahul Verma',
            'email' => 'rahul@uply.io',
            'password' => Hash::make('password123'),
            'bio' => 'Frontend Enthusiast & React Developer. Passionate about UI/UX.',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            'streak_count' => 5,
            'highest_streak' => 10,
            'tasks_completed' => 19,
            'total_points' => 520,
            'level' => 2,
            'title' => 'Growth Scout',
        ]);

        $sarah = User::create([
            'name' => 'Sarah Chen',
            'email' => 'sarah@uply.io',
            'password' => Hash::make('password123'),
            'bio' => 'Mobile Dev & Tech Writer. Coffee & Code lover ☕',
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            'streak_count' => 12,
            'highest_streak' => 18,
            'tasks_completed' => 45,
            'total_points' => 1100,
            'level' => 4,
            'title' => 'Streak Titan',
        ]);

        // 3. Friendships
        Friend::create(['user_id' => $ameen->id, 'friend_id' => $rahul->id, 'status' => 'accepted']);
        Friend::create(['user_id' => $ameen->id, 'friend_id' => $sarah->id, 'status' => 'accepted']);

        // Unlock achievements for Ameen
        $firstGoalAch = Achievement::where('code', 'first_goal')->first();
        $streak7Ach = Achievement::where('code', 'streak_7')->first();
        $helpedAch = Achievement::where('code', 'helped_friend')->first();

        UserAchievement::create(['user_id' => $ameen->id, 'achievement_id' => $firstGoalAch->id, 'unlocked_at' => now()->subDays(10)]);
        UserAchievement::create(['user_id' => $ameen->id, 'achievement_id' => $streak7Ach->id, 'unlocked_at' => now()->subDays(2)]);
        UserAchievement::create(['user_id' => $ameen->id, 'achievement_id' => $helpedAch->id, 'unlocked_at' => now()->subDays(1)]);

        // 4. Goals
        $goal1 = Goal::create([
            'user_id' => $ameen->id,
            'title' => 'Learn Laravel in 30 days',
            'description' => 'Master PHP Laravel backend framework, Eloquent ORM, Sanctum Auth & REST APIs.',
            'category' => 'Coding',
            'target_date' => Carbon::today()->addDays(20)->toDateString(),
            'status' => 'active',
            'color' => '#6366f1',
            'icon' => 'code',
            'progress_percentage' => 50,
        ]);

        GoalMilestone::create(['goal_id' => $goal1->id, 'title' => 'Learn routing & middleware', 'is_completed' => true, 'order' => 1]);
        GoalMilestone::create(['goal_id' => $goal1->id, 'title' => 'Learn database migrations & seeders', 'is_completed' => true, 'order' => 2]);
        GoalMilestone::create(['goal_id' => $goal1->id, 'title' => 'Master Eloquent ORM relationships', 'is_completed' => true, 'order' => 3]);
        GoalMilestone::create(['goal_id' => $goal1->id, 'title' => 'Build Uply REST API with Sanctum', 'is_completed' => false, 'order' => 4]);
        GoalMilestone::create(['goal_id' => $goal1->id, 'title' => 'Authentication & CORS Security', 'is_completed' => false, 'order' => 5]);
        GoalMilestone::create(['goal_id' => $goal1->id, 'title' => 'Deploy full stack app to production', 'is_completed' => false, 'order' => 6]);

        $goal2 = Goal::create([
            'user_id' => $ameen->id,
            'title' => 'Fitness & Health Reboot',
            'description' => 'Build endurance, strength training 4x week, and drink 3L water daily.',
            'category' => 'Health',
            'target_date' => Carbon::today()->addDays(45)->toDateString(),
            'status' => 'active',
            'color' => '#10b981',
            'icon' => 'heart-pulse',
            'progress_percentage' => 33,
        ]);

        GoalMilestone::create(['goal_id' => $goal2->id, 'title' => 'Run 5km without stopping', 'is_completed' => true, 'order' => 1]);
        GoalMilestone::create(['goal_id' => $goal2->id, 'title' => 'Complete 30 consecutive days of 10k steps', 'is_completed' => false, 'order' => 2]);
        GoalMilestone::create(['goal_id' => $goal2->id, 'title' => 'Bench press target weight', 'is_completed' => false, 'order' => 3]);

        // 5. Habits for Ameen
        $h1 = Habit::create([
            'user_id' => $ameen->id,
            'title' => 'Code 1 hour daily',
            'description' => 'Dedicated focused deep work building full stack apps.',
            'frequency' => 'daily',
            'category' => 'Coding',
            'color' => '#6366f1',
            'icon' => 'code',
            'current_streak' => 7,
            'best_streak' => 14,
        ]);

        $h2 = Habit::create([
            'user_id' => $ameen->id,
            'title' => 'Read 10 pages daily',
            'description' => 'Read tech architecture & personal growth books.',
            'frequency' => 'daily',
            'category' => 'Mindset',
            'color' => '#f59e0b',
            'icon' => 'book-open',
            'current_streak' => 5,
            'best_streak' => 10,
        ]);

        $h3 = Habit::create([
            'user_id' => $ameen->id,
            'title' => 'Exercise 30 minutes',
            'description' => 'Morning HIIT workout or gym session.',
            'frequency' => 'daily',
            'category' => 'Fitness',
            'color' => '#10b981',
            'icon' => 'activity',
            'current_streak' => 4,
            'best_streak' => 7,
        ]);

        // Habit logs for last 7 days
        for ($i = 0; $i < 7; $i++) {
            $date = Carbon::today()->subDays($i)->toDateString();
            HabitLog::create(['habit_id' => $h1->id, 'user_id' => $ameen->id, 'completed_date' => $date]);
            if ($i < 5) HabitLog::create(['habit_id' => $h2->id, 'user_id' => $ameen->id, 'completed_date' => $date]);
            if ($i < 4) HabitLog::create(['habit_id' => $h3->id, 'user_id' => $ameen->id, 'completed_date' => $date]);
        }

        // 6. Personal & Friend Assigned Tasks
        $t1 = Task::create([
            'user_id' => $ameen->id,
            'goal_id' => $goal1->id,
            'title' => 'Implement Sanctum Auth Endpoints',
            'description' => 'Build login, register, logout, and user profile endpoints in Laravel.',
            'priority' => 'high',
            'due_date' => Carbon::today()->toDateString(),
            'category' => 'Coding',
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        TaskSubtask::create(['task_id' => $t1->id, 'title' => 'Create AuthController', 'is_completed' => true]);
        TaskSubtask::create(['task_id' => $t1->id, 'title' => 'Configure Sanctum middleware in api.php', 'is_completed' => true]);

        $t2 = Task::create([
            'user_id' => $ameen->id,
            'goal_id' => $goal1->id,
            'title' => 'Design React Glassmorphism Dashboard UI',
            'description' => 'Build futuristic dark mode navigation, goal progress bar, and habit streak cards.',
            'priority' => 'high',
            'due_date' => Carbon::today()->toDateString(),
            'category' => 'Coding',
            'status' => 'in_progress',
        ]);

        TaskSubtask::create(['task_id' => $t2->id, 'title' => 'Setup Lucide icons & Tailwind gradients', 'is_completed' => true]);
        TaskSubtask::create(['task_id' => $t2->id, 'title' => 'Connect Axios API handlers', 'is_completed' => false]);

        // TASK ASSIGNED TO FRIEND: Ameen -> Rahul
        $tFriendAssigned = Task::create([
            'user_id' => $rahul->id, // Assigned to Rahul
            'assigned_by_id' => $ameen->id, // Assigned BY Ameen
            'title' => 'Complete React Dashboard Component by Friday',
            'description' => 'Build responsive widget layout with habit streak grid and goal charts.',
            'priority' => 'high',
            'due_date' => Carbon::today()->addDays(2)->toDateString(),
            'category' => 'Coding',
            'status' => 'pending', // Pending acceptance
        ]);

        // TASK ASSIGNED BY FRIEND: Rahul -> Ameen
        $tFriendAssignedToMe = Task::create([
            'user_id' => $ameen->id,
            'assigned_by_id' => $rahul->id,
            'title' => 'Review React State Management & Axios Interceptors',
            'description' => 'Ensure JWT bearer token headers are automatically attached.',
            'priority' => 'medium',
            'due_date' => Carbon::today()->addDays(1)->toDateString(),
            'category' => 'Coding',
            'status' => 'accepted',
        ]);

        // 7. Challenges
        $c1 = Challenge::create([
            'creator_id' => $ameen->id,
            'title' => '30-Day Full Stack Coding Challenge',
            'description' => 'Ship code every single day for 30 consecutive days. Track progress with accountability buddies!',
            'category' => 'Coding',
            'duration_days' => 30,
            'start_date' => Carbon::today()->subDays(5)->toDateString(),
            'end_date' => Carbon::today()->addDays(25)->toDateString(),
            'is_public' => true,
            'banner_color' => '#6366f1',
        ]);

        ChallengeParticipant::create(['challenge_id' => $c1->id, 'user_id' => $ameen->id, 'status' => 'active', 'streak_count' => 7, 'progress_percentage' => 45]);
        ChallengeParticipant::create(['challenge_id' => $c1->id, 'user_id' => $rahul->id, 'status' => 'active', 'streak_count' => 5, 'progress_percentage' => 35]);
        ChallengeParticipant::create(['challenge_id' => $c1->id, 'user_id' => $sarah->id, 'status' => 'active', 'streak_count' => 12, 'progress_percentage' => 70]);

        $c2 = Challenge::create([
            'creator_id' => $sarah->id,
            'title' => '5 AM Club — Morning Routine Sprint',
            'description' => 'Wake up early, meditate 15m, workout 30m, and plan your top 3 daily priorities.',
            'category' => 'Mindset',
            'duration_days' => 21,
            'start_date' => Carbon::today()->subDays(2)->toDateString(),
            'end_date' => Carbon::today()->addDays(19)->toDateString(),
            'is_public' => true,
            'banner_color' => '#f59e0b',
        ]);

        ChallengeParticipant::create(['challenge_id' => $c2->id, 'user_id' => $sarah->id, 'status' => 'active', 'streak_count' => 8, 'progress_percentage' => 55]);
        ChallengeParticipant::create(['challenge_id' => $c2->id, 'user_id' => $ameen->id, 'status' => 'active', 'streak_count' => 4, 'progress_percentage' => 30]);

        // 8. Notifications for Ameen
        UplyNotification::create([
            'user_id' => $ameen->id,
            'sender_id' => $rahul->id,
            'type' => 'task_accepted',
            'title' => 'Rahul accepted your task',
            'message' => 'Rahul accepted "Review React State Management & Axios Interceptors"',
            'data' => ['task_id' => $tFriendAssignedToMe->id],
            'is_read' => false,
        ]);

        UplyNotification::create([
            'user_id' => $ameen->id,
            'sender_id' => null,
            'type' => 'streak_milestone',
            'title' => '🔥 Reached a 7-day streak!',
            'message' => 'Awesome consistency! You reached a 7-day habit streak.',
            'data' => [],
            'is_read' => false,
        ]);

        UplyNotification::create([
            'user_id' => $ameen->id,
            'sender_id' => null,
            'type' => 'goal_progress',
            'title' => '🎯 Goal reached 50%',
            'message' => 'Goal "Learn Laravel in 30 days" reached 50% milestone progress!',
            'data' => ['goal_id' => $goal1->id],
            'is_read' => true,
        ]);

        // 9. Activity Feeds
        ActivityFeed::create(['user_id' => $rahul->id, 'type' => 'habit_completed', 'content' => 'completed habit: React Component Practice']);
        ActivityFeed::create(['user_id' => $sarah->id, 'type' => 'goal_created', 'content' => 'created a new goal: Launch Flutter Mobile App']);
        ActivityFeed::create(['user_id' => $ameen->id, 'type' => 'task_completed', 'content' => 'completed task: Implement Sanctum Auth Endpoints']);

        // 10. Demo Expenses for Ameen
        Expense::create([
            'user_id' => $ameen->id,
            'title' => 'Vite & Tailwind Pro UI Kit License',
            'amount' => 49.99,
            'category' => 'Office',
            'date' => Carbon::today()->subDays(2)->toDateString(),
            'notes' => 'Purchased for frontend dashboard components.',
        ]);

        Expense::create([
            'user_id' => $ameen->id,
            'title' => 'Ergonomic Desk Chair & Desk Pad',
            'amount' => 189.50,
            'category' => 'Office',
            'date' => Carbon::today()->subDays(5)->toDateString(),
            'notes' => 'Office workspace setup enhancement.',
        ]);

        Expense::create([
            'user_id' => $ameen->id,
            'title' => 'Weekly Groceries & Protein Powder',
            'amount' => 85.00,
            'category' => 'Personal',
            'date' => Carbon::today()->subDays(1)->toDateString(),
            'notes' => 'Personal diet and meal prep.',
        ]);

        Expense::create([
            'user_id' => $ameen->id,
            'title' => 'Wireless Mechanical Keyboard',
            'amount' => 120.00,
            'category' => 'Purchase',
            'date' => Carbon::today()->toDateString(),
            'notes' => 'Tech gear upgrade for coding speed.',
        ]);

        // 11. Demo Tote Pad Notes for Ameen
        Note::create([
            'user_id' => $ameen->id,
            'title' => '📌 Q4 Tech Stack Roadmap & Ideas',
            'content' => "• Migrate REST controllers to Sanctum auth middleware\n• Add real-time WebSocket notifications for friend task assignments\n• Create Tote Pad & Expense Tracker widgets for home dashboard",
            'category' => 'Office',
            'color' => '#6366f1',
            'is_pinned' => true,
        ]);

        Note::create([
            'user_id' => $ameen->id,
            'title' => '🛒 Tech Gear Purchase Wishlist',
            'content' => "1. Ultra-wide 4K Monitor for multi-window coding\n2. Noise-cancelling headphones for deep focus hours\n3. Standing desk converter",
            'category' => 'Purchase',
            'color' => '#f59e0b',
            'is_pinned' => true,
        ]);

        Note::create([
            'user_id' => $ameen->id,
            'title' => '💡 Personal Daily Morning Routine',
            'content' => "• 06:30 AM: Wake up & 500ml water\n• 07:00 AM: 30m HIIT Gym workout\n• 08:30 AM: Code sprint & Laravel API testing",
            'category' => 'Personal',
            'color' => '#10b981',
            'is_pinned' => false,
        ]);

        // 12. Demo Credits & Cash Received for Ameen
        Credit::create([
            'user_id' => $ameen->id,
            'title' => 'Freelance Web Design Payment',
            'amount' => 500.00,
            'received_from' => 'Client: TechCorp',
            'payment_method' => 'Bank Transfer',
            'category' => 'Freelance',
            'date' => Carbon::today()->subDays(3)->toDateString(),
            'notes' => 'Milestone 1 completed for full stack dashboard.',
        ]);

        Credit::create([
            'user_id' => $ameen->id,
            'title' => 'Cash handed over for shared project expenses',
            'amount' => 150.00,
            'received_from' => 'Rahul Verma',
            'payment_method' => 'Cash',
            'category' => 'Friend',
            'date' => Carbon::today()->subDays(1)->toDateString(),
            'notes' => 'Rahul paid back cash for UI kit subscription.',
        ]);

        Credit::create([
            'user_id' => $ameen->id,
            'title' => 'Monthly Salary Allowance',
            'amount' => 1200.00,
            'received_from' => 'Company Payroll',
            'payment_method' => 'Bank Transfer',
            'category' => 'Salary',
            'date' => Carbon::today()->subDays(10)->toDateString(),
            'notes' => 'Regular monthly income.',
        ]);

        // 13. Demo Buying Wishlist & Life Ambition Items for Ameen
        BuyingItem::create([
            'user_id' => $ameen->id,
            'title' => '🏍️ Royal Enfield / Dream Sports Bike',
            'estimated_price' => 3500.00,
            'priority' => 'high',
            'status' => 'planned',
            'category' => 'Vehicle',
            'store_url' => 'https://royalenfield.com',
            'notes' => 'Life ambition goal: Dream motorcycle purchase for weekend rides!',
        ]);

        BuyingItem::create([
            'user_id' => $ameen->id,
            'title' => '💍 Custom 22K Gold Chain & Signet Ring',
            'estimated_price' => 1200.00,
            'priority' => 'high',
            'status' => 'wishlist',
            'category' => 'Jewelry',
            'notes' => 'Personal asset milestone & luxury jewelry goal.',
        ]);

        BuyingItem::create([
            'user_id' => $ameen->id,
            'title' => '🍔 Gourmet Fine Dining & Food Tasting Experience',
            'estimated_price' => 150.00,
            'priority' => 'medium',
            'status' => 'planned',
            'category' => 'Food & Dining',
            'notes' => 'Celebration food outing with friends & family.',
        ]);

        BuyingItem::create([
            'user_id' => $ameen->id,
            'title' => 'Curved 34" 4K Monitor',
            'estimated_price' => 450.00,
            'priority' => 'high',
            'status' => 'planned',
            'category' => 'Office',
            'store_url' => 'https://amazon.com',
            'notes' => 'High resolution display for split-screen coding.',
        ]);

        BuyingItem::create([
            'user_id' => $ameen->id,
            'title' => 'Sony WH-1000XM5 Headphones',
            'estimated_price' => 320.00,
            'priority' => 'medium',
            'status' => 'wishlist',
            'category' => 'Tech',
            'store_url' => 'https://amazon.com',
            'notes' => 'Active noise cancellation for deep work focus.',
        ]);

        BuyingItem::create([
            'user_id' => $ameen->id,
            'title' => 'Ergonomic Vertical Mouse',
            'estimated_price' => 79.99,
            'priority' => 'low',
            'status' => 'purchased',
            'category' => 'Office',
            'notes' => 'Bought for wrist comfort during long coding sessions.',
        ]);
    }
}
