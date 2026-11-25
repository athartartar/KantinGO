<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'warung_id',
        'category_id',
        'name',
        'description',
        'price',
        'image_path',
        'is_available',
        'rating_avg',
        'sold_count',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'is_available' => 'boolean',
            'rating_avg' => 'float',
            'sold_count' => 'integer',
        ];
    }

    public function warung(): BelongsTo
    {
        return $this->belongsTo(Warung::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function addons(): HasMany
    {
        return $this->hasMany(MenuAddon::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
