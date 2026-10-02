<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'user_id',
        'assigned_by_id',
        'goal_id',
        'title',
        'description',
        'priority',
        'due_date',
        'category',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by_id');
    }

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }

    public function subtasks()
    {
        return $this->hasMany(TaskSubtask::class);
    }
}
