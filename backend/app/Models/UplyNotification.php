<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UplyNotification extends Model
{
    protected $table = 'uply_notifications';

    protected $fillable = [
        'user_id',
        'sender_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
