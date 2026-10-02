<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'target_date',
        'status',
        'color',
        'icon',
        'progress_percentage',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function milestones()
    {
        return $this->hasMany(GoalMilestone::class)->orderBy('order');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
