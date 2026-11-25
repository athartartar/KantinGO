<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use RuntimeException;

class WalletTransaction extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    public const TYPE_PAYMENT_IN = 'payment_in';

    public const TYPE_HOLD = 'hold';

    public const TYPE_RELEASE = 'release';

    public const TYPE_REFUND = 'refund';

    public const TYPE_WITHDRAWAL = 'withdrawal';

    public const TYPE_FEE = 'fee';

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'balance_after',
        'order_id',
        'withdrawal_id',
        'reference',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'balance_after' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::updating(function () {
            throw new RuntimeException('Catatan ledger tidak dapat diubah.');
        });

        static::deleting(function () {
            throw new RuntimeException('Catatan ledger tidak dapat dihapus.');
        });
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function withdrawal(): BelongsTo
    {
        return $this->belongsTo(Withdrawal::class);
    }
}
