<?php

namespace Database\Factories;

use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class VoucherFactory extends Factory
{
    protected $model = Voucher::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper(Str::random(8)),
            'title' => 'Promo KantinGO '.fake()->numberBetween(5, 20).'K',
            'type' => 'nominal',
            'value' => 5000,
            'min_spend' => 15000,
            'points_cost' => 100,
            'max_discount' => null,
            'quota' => 100,
            'used_count' => 0,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addMonth(),
            'is_active' => true,
        ];
    }
}
