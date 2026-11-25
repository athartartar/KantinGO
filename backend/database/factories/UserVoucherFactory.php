<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserVoucher;
use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserVoucherFactory extends Factory
{
    protected $model = UserVoucher::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'voucher_id' => Voucher::factory(),
            'status' => 'active',
            'claimed_at' => now(),
            'used_at' => null,
        ];
    }
}
