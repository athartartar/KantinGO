<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_code',
        'user_id',
        'warung_id',
        'voucher_id',
        'pickup_time',
        'subtotal',
        'discount',
        'service_fee',
        'total',
        'status',
        'notes',
        'completed_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'discount' => 'integer',
            'service_fee' => 'integer',
            'total' => 'integer',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function warung(): BelongsTo
    {
        return $this->belongsTo(Warung::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function pointTransactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class);
    }
}
