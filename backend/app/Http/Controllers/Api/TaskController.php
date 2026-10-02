<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskSubtask;
use App\Models\UplyNotification;
use App\Models\ActivityFeed;
use App\Models\Achievement;
use App\Models\UserAchievement;
use App\Models\User;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $tasks = Task::where(function($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('assigned_by_id', $user->id);
        })
        ->with(['user', 'assignedBy', 'goal', 'subtasks'])
        ->latest()
        ->get();

        return response()->json(['tasks' => $tasks]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
            'due_date' => 'nullable|date',
            'category' => 'nullable|string',
            'goal_id' => 'nullable|exists:goals,id',
            'assigned_to_user_id' => 'nullable|exists:users,id',
            'subtasks' => 'nullable|array',
            'subtasks.*.title' => 'required|string',
        ]);

        $targetUserId = $user->id;
        $assignedById = null;
        $status = 'in_progress';

        // Direct Task Assignment to Friend!
        if (!empty($validated['assigned_to_user_id']) && $validated['assigned_to_user_id'] != $user->id) {
            $targetUserId = $validated['assigned_to_user_id'];
            $assignedById = $user->id;
            $status = 'pending'; // Requires friend acceptance!
        }

        $task = Task::create([
            'user_id' => $targetUserId,
            'assigned_by_id' => $assignedById,
            'goal_id' => $validated['goal_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'due_date' => $validated['due_date'] ?? null,
            'category' => $validated['category'] ?? 'General',
            'status' => $status,
        ]);

        if (!empty($validated['subtasks'])) {
            foreach ($validated['subtasks'] as $sub) {
                TaskSubtask::create([
                    'task_id' => $task->id,
                    'title' => $sub['title'],
                    'is_completed' => false,
                ]);
            }
        }

        // Send Notification if assigned to a friend
        if ($assignedById) {
            UplyNotification::create([
                'user_id' => $targetUserId,
                'sender_id' => $user->id,
                'type' => 'task_assigned',
                'title' => 'New Task Assigned',
                'message' => "{$user->name} assigned you a task: '{$task->title}'",
                'data' => ['task_id' => $task->id],
            ]);

            // Achievement check for helping a friend
            $helpedAch = Achievement::where('code', 'helped_friend')->first();
            if ($helpedAch && !$user->achievements()->where('achievement_id', $helpedAch->id)->exists()) {
                UserAchievement::create([
                    'user_id' => $user->id,
                    'achievement_id' => $helpedAch->id,
                    'unlocked_at' => now(),
                ]);
                $user->increment('total_points', $helpedAch->points);
            }
        }

        return response()->json(['task' => $task->load(['user', 'assignedBy', 'goal', 'subtasks'])], 201);
    }

    public function updateStatus($id, Request $request)
    {
        $user = $request->user();
        $task = Task::where(function($q) use ($user) {
            $q->where('user_id', $user->id)->orWhere('assigned_by_id', $user->id);
        })->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:pending,accepted,in_progress,completed,declined',
        ]);

        $oldStatus = $task->status;
        $newStatus = $validated['status'];

        $task->status = $newStatus;
        if ($newStatus === 'completed') {
            $task->completed_at = now();

            // Reward points and update task completion count
            $user->increment('tasks_completed');
            $user->increment('total_points', 15);

            // Create activity
            ActivityFeed::create([
                'user_id' => $user->id,
                'type' => 'task_completed',
                'content' => "completed task: {$task->title}",
                'meta' => ['task_id' => $task->id],
            ]);

            // If task was assigned by a friend, notify creator!
            if ($task->assigned_by_id && $task->assigned_by_id != $user->id) {
                UplyNotification::create([
                    'user_id' => $task->assigned_by_id,
                    'sender_id' => $user->id,
                    'type' => 'task_completed',
                    'title' => 'Assigned Task Completed! ✓',
                    'message' => "{$user->name} completed your assigned task: '{$task->title}'",
                    'data' => ['task_id' => $task->id],
                ]);
            }

            // Check 100 tasks achievement
            if ($user->tasks_completed >= 100) {
                $tasks100Ach = Achievement::where('code', 'tasks_100')->first();
                if ($tasks100Ach && !$user->achievements()->where('achievement_id', $tasks100Ach->id)->exists()) {
                    UserAchievement::create([
                        'user_id' => $user->id,
                        'achievement_id' => $tasks100Ach->id,
                        'unlocked_at' => now(),
                    ]);
                    $user->increment('total_points', $tasks100Ach->points);
                }
            }
        } elseif ($newStatus === 'accepted' && $task->assigned_by_id) {
            UplyNotification::create([
                'user_id' => $task->assigned_by_id,
                'sender_id' => $user->id,
                'type' => 'task_accepted',
                'title' => 'Task Accepted',
                'message' => "{$user->name} accepted your task: '{$task->title}'",
                'data' => ['task_id' => $task->id],
            ]);
        }

        $task->save();

        return response()->json(['task' => $task->load(['user', 'assignedBy', 'goal', 'subtasks'])]);
    }

    public function toggleSubtask($taskId, $subtaskId, Request $request)
    {
        $task = Task::where('user_id', $request->user()->id)->where('id', $taskId)->firstOrFail();
        $subtask = TaskSubtask::where('task_id', $task->id)->where('id', $subtaskId)->firstOrFail();

        $subtask->update(['is_completed' => !$subtask->is_completed]);

        return response()->json(['subtask' => $subtask, 'task' => $task->load('subtasks')]);
    }

    public function destroy($id, Request $request)
    {
        $user = $request->user();
        $task = Task::where(function($q) use ($user) {
            $q->where('user_id', $user->id)->orWhere('assigned_by_id', $user->id);
        })->where('id', $id)->firstOrFail();

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function assignedTasksHub(Request $request)
    {
        $user = $request->user();

        // Tasks assigned TO user by friends
        $receivedTasks = Task::where('user_id', $user->id)
            ->whereNotNull('assigned_by_id')
            ->with(['assignedBy', 'goal', 'subtasks'])
            ->latest()
            ->get();

        // Tasks assigned BY user to friends
        $sentTasks = Task::where('assigned_by_id', $user->id)
            ->with(['user', 'goal', 'subtasks'])
            ->latest()
            ->get();

        // All community assigned tasks across all users
        $allCommunityAssignedTasks = Task::whereNotNull('assigned_by_id')
            ->with(['user', 'assignedBy', 'goal'])
            ->latest()
            ->take(30)
            ->get();

        return response()->json([
            'received_tasks' => $receivedTasks,
            'sent_tasks' => $sentTasks,
            'community_assigned_tasks' => $allCommunityAssignedTasks,
        ]);
    }
}
