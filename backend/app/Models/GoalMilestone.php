<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoalMilestone extends Model
{
    protected $fillable = [
        'goal_id',
        'title',
        'is_completed',
        'due_date',
        'order',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
    ];

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }
}
