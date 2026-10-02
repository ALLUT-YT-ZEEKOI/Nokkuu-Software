<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\UserAchievement;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $achievements = Achievement::all();
        $unlockedIds = UserAchievement::where('user_id', $user->id)
            ->pluck('unlocked_at', 'achievement_id')
            ->toArray();

        $achievements = $achievements->map(function($ach) use ($unlockedIds) {
            $ach->is_unlocked = array_key_exists($ach->id, $unlockedIds);
            $ach->unlocked_at = $ach->is_unlocked ? $unlockedIds[$ach->id] : null;
            return $ach;
        });

        return response()->json([
            'achievements' => $achievements,
            'total_unlocked' => count($unlockedIds),
            'total_points' => $user->total_points,
            'level' => $user->level,
            'title' => $user->title,
        ]);
    }
}
