<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'type',
        'value',
        'min_spend',
        'max_discount',
        'quota',
        'used_count',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'integer',
            'min_spend' => 'integer',
            'max_discount' => 'integer',
            'quota' => 'integer',
            'used_count' => 'integer',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function userVouchers(): HasMany
    {
        return $this->hasMany(UserVoucher::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
