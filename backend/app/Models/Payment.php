<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payment_code',
        'method',
        'amount',
        'status',
        'qris_payload',
        'provider_reference',
        'expires_at',
        'paid_at',
    ];

    protected $hidden = [
        'provider_reference',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
