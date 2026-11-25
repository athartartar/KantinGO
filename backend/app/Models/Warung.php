<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warung extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'canteen_id',
        'name',
        'slug',
        'description',
        'location',
        'opening_hours',
        'logo_path',
        'estimated_minutes',
        'rating_avg',
        'review_count',
        'status',
        'rejection_reason',
        'is_open',
        'approved_at',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'estimated_minutes' => 'integer',
            'rating_avg' => 'float',
            'review_count' => 'integer',
            'is_open' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function canteen(): BelongsTo
    {
        return $this->belongsTo(Canteen::class);
    }

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
