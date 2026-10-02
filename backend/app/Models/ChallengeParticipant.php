<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeParticipant extends Model
{
    protected $fillable = [
        'challenge_id',
        'user_id',
        'status',
        'streak_count',
        'progress_percentage',
        'joined_at',
    ];

    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
