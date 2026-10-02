<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Models\GoalMilestone;
use App\Models\ActivityFeed;
use App\Models\Achievement;
use App\Models\UserAchievement;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        $goals = Goal::where('user_id', $request->user()->id)
            ->with(['milestones', 'tasks'])
            ->latest()
            ->get();

        return response()->json(['goals' => $goals]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'target_date' => 'nullable|date',
            'color' => 'nullable|string',
            'icon' => 'nullable|string',
            'milestones' => 'nullable|array',
            'milestones.*.title' => 'required|string',
        ]);

        $user = $request->user();

        $goal = Goal::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? 'General',
            'target_date' => $validated['target_date'] ?? null,
            'color' => $validated['color'] ?? '#6366f1',
            'icon' => $validated['icon'] ?? 'target',
            'progress_percentage' => 0,
        ]);

        if (!empty($validated['milestones'])) {
            foreach ($validated['milestones'] as $index => $m) {
                GoalMilestone::create([
                    'goal_id' => $goal->id,
                    'title' => $m['title'],
                    'is_completed' => false,
                    'order' => $index,
                ]);
            }
        }

        // Create Activity
        ActivityFeed::create([
            'user_id' => $user->id,
            'type' => 'goal_created',
            'content' => "created a new goal: {$goal->title}",
            'meta' => ['goal_id' => $goal->id, 'goal_title' => $goal->title],
        ]);

        // Check First Goal Achievement
        $firstGoalAch = Achievement::where('code', 'first_goal')->first();
        if ($firstGoalAch && !$user->achievements()->where('achievement_id', $firstGoalAch->id)->exists()) {
            UserAchievement::create([
                'user_id' => $user->id,
                'achievement_id' => $firstGoalAch->id,
                'unlocked_at' => now(),
            ]);
            $user->increment('total_points', $firstGoalAch->points);
        }

        return response()->json(['goal' => $goal->load('milestones')], 201);
    }

    public function show($id, Request $request)
    {
        $goal = Goal::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->with(['milestones', 'tasks'])
            ->firstOrFail();

        return response()->json(['goal' => $goal]);
    }

    public function update($id, Request $request)
    {
        $goal = Goal::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'target_date' => 'nullable|date',
            'color' => 'nullable|string',
            'icon' => 'nullable|string',
            'status' => 'sometimes|in:active,completed,archived',
            'progress_percentage' => 'sometimes|integer|min:0|max:100',
        ]);

        $goal->update($validated);

        return response()->json(['goal' => $goal->load('milestones')]);
    }

    public function toggleMilestone($goalId, $milestoneId, Request $request)
    {
        $goal = Goal::where('user_id', $request->user()->id)->where('id', $goalId)->firstOrFail();
        $milestone = GoalMilestone::where('goal_id', $goal->id)->where('id', $milestoneId)->firstOrFail();

        $milestone->update(['is_completed' => !$milestone->is_completed]);

        // Recalculate goal progress
        $totalMilestones = $goal->milestones()->count();
        if ($totalMilestones > 0) {
            $completedCount = $goal->milestones()->where('is_completed', true)->count();
            $progress = round(($completedCount / $totalMilestones) * 100);
            $newStatus = $progress >= 100 ? 'completed' : 'active';
            $goal->update(['progress_percentage' => $progress, 'status' => $newStatus]);
        }

        return response()->json([
            'milestone' => $milestone,
            'goal' => $goal->fresh(['milestones']),
        ]);
    }

    public function addMilestone($goalId, Request $request)
    {
        $goal = Goal::where('user_id', $request->user()->id)->where('id', $goalId)->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string',
            'due_date' => 'nullable|date',
        ]);

        $order = $goal->milestones()->count();

        $milestone = GoalMilestone::create([
            'goal_id' => $goal->id,
            'title' => $validated['title'],
            'due_date' => $validated['due_date'] ?? null,
            'is_completed' => false,
            'order' => $order,
        ]);

        // Recalculate goal progress
        $totalMilestones = $goal->milestones()->count();
        $completedCount = $goal->milestones()->where('is_completed', true)->count();
        $progress = round(($completedCount / $totalMilestones) * 100);
        $goal->update(['progress_percentage' => $progress]);

        return response()->json(['milestone' => $milestone, 'goal' => $goal->fresh(['milestones'])]);
    }

    public function destroy($id, Request $request)
    {
        $goal = Goal::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();
        $goal->delete();

        return response()->json(['message' => 'Goal deleted successfully']);
    }
}
