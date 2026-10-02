<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityFeed extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'content',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
