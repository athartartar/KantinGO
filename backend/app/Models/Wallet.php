<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;

    public const TYPE_PLATFORM = 'platform';

    public const TYPE_PARTNER = 'partner';

    protected $fillable = [
        'type',
        'user_id',
        'pending_balance',
        'available_balance',
    ];

    protected function casts(): array
    {
        return [
            'pending_balance' => 'integer',
            'available_balance' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }
}
