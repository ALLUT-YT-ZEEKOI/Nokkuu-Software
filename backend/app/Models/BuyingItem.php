<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuyingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'estimated_price',
        'priority',
        'status',
        'category',
        'store_url',
        'notes',
    ];

    protected $casts = [
        'estimated_price' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
