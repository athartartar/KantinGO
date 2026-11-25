<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PointTransactionFactory extends Factory
{
    protected $model = PointTransaction::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'order_id' => Order::factory(),
            'type' => 'earn',
            'amount' => 100,
            'balance_after' => 100,
            'description' => 'Poin transaksi pesanan selesai',
        ];
    }
}
