<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\ChallengeParticipant;
use App\Models\ActivityFeed;
use App\Models\Achievement;
use App\Models\UserAchievement;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ChallengeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $challenges = Challenge::with(['creator', 'participants.user'])
            ->latest()
            ->get();

        $challenges = $challenges->map(function($c) use ($user) {
            $participant = $c->participants->firstWhere('user_id', $user->id);
            $c->is_joined = (bool) $participant;
            $c->user_progress = $participant ? $participant->progress_percentage : 0;
            $c->user_streak = $participant ? $participant->streak_count : 0;
            return $c;
        });

        return response()->json(['challenges' => $challenges]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'duration_days' => 'required|integer|min:1|max:365',
            'banner_color' => 'nullable|string',
        ]);

        $challenge = Challenge::create([
            'creator_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? 'Coding',
            'duration_days' => $validated['duration_days'],
            'start_date' => Carbon::today()->toDateString(),
            'end_date' => Carbon::today()->addDays($validated['duration_days'])->toDateString(),
            'is_public' => true,
            'banner_color' => $validated['banner_color'] ?? '#8b5cf6',
        ]);

        // Auto-join creator
        ChallengeParticipant::create([
            'challenge_id' => $challenge->id,
            'user_id' => $user->id,
            'status' => 'active',
            'streak_count' => 1,
            'progress_percentage' => 0,
        ]);

        ActivityFeed::create([
            'user_id' => $user->id,
            'type' => 'challenge_created',
            'content' => "started a new challenge: {$challenge->title}",
            'meta' => ['challenge_id' => $challenge->id],
        ]);

        // First Challenge Achievement Check
        $firstChalAch = Achievement::where('code', 'first_challenge')->first();
        if ($firstChalAch && !$user->achievements()->where('achievement_id', $firstChalAch->id)->exists()) {
            UserAchievement::create([
                'user_id' => $user->id,
                'achievement_id' => $firstChalAch->id,
                'unlocked_at' => now(),
            ]);
            $user->increment('total_points', $firstChalAch->points);
        }

        return response()->json(['challenge' => $challenge->load(['creator', 'participants.user'])], 201);
    }

    public function join($id, Request $request)
    {
        $user = $request->user();
        $challenge = Challenge::findOrFail($id);

        $participant = ChallengeParticipant::firstOrCreate(
            ['challenge_id' => $challenge->id, 'user_id' => $user->id],
            [
                'status' => 'active',
                'streak_count' => 1,
                'progress_percentage' => 0,
            ]
        );

        ActivityFeed::create([
            'user_id' => $user->id,
            'type' => 'challenge_joined',
            'content' => "joined challenge: {$challenge->title}",
            'meta' => ['challenge_id' => $challenge->id],
        ]);

        // First Challenge Achievement Check
        $firstChalAch = Achievement::where('code', 'first_challenge')->first();
        if ($firstChalAch && !$user->achievements()->where('achievement_id', $firstChalAch->id)->exists()) {
            UserAchievement::create([
                'user_id' => $user->id,
                'achievement_id' => $firstChalAch->id,
                'unlocked_at' => now(),
            ]);
            $user->increment('total_points', $firstChalAch->points);
        }

        return response()->json(['participant' => $participant, 'challenge' => $challenge->load(['creator', 'participants.user'])]);
    }

    public function updateProgress($id, Request $request)
    {
        $user = $request->user();
        $challenge = Challenge::findOrFail($id);
        $participant = ChallengeParticipant::where('challenge_id', $challenge->id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'progress_percentage' => 'required|integer|min:0|max:100',
        ]);

        $newProgress = $validated['progress_percentage'];
        $status = $newProgress >= 100 ? 'completed' : 'active';
        $newStreak = $participant->streak_count + 1;

        $participant->update([
            'progress_percentage' => $newProgress,
            'streak_count' => $newStreak,
            'status' => $status,
        ]);

        return response()->json(['participant' => $participant]);
    }

    public function show($id, Request $request)
    {
        $challenge = Challenge::with(['creator', 'participants.user'])->findOrFail($id);
        $leaderboard = $challenge->participants->sortByDesc('progress_percentage')->values();

        return response()->json([
            'challenge' => $challenge,
            'leaderboard' => $leaderboard,
        ]);
    }
}
