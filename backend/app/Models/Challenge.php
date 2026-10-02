<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    protected $fillable = [
        'creator_id',
        'title',
        'description',
        'category',
        'duration_days',
        'start_date',
        'end_date',
        'is_public',
        'banner_color',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function participants()
    {
        return $this->hasMany(ChallengeParticipant::class);
    }
}
