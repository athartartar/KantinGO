<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuAddon extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_id',
        'group_key',
        'group_title',
        'selection_type',
        'is_required',
        'option_name',
        'additional_price',
        'is_available',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'additional_price' => 'integer',
            'is_available' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }
}
