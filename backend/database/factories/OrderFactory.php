<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use App\Models\Warung;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(15, 50) * 1000;
        $serviceFee = 1000;

        return [
            'order_code' => 'KGO-'.strtoupper(Str::random(8)),
            'user_id' => User::factory(),
            'warung_id' => Warung::factory(),
            'voucher_id' => null,
            'pickup_time' => '12:00 - 12:15',
            'subtotal' => $subtotal,
            'discount' => 0,
            'service_fee' => $serviceFee,
            'total' => $subtotal + $serviceFee,
            'status' => 'menunggu_pembayaran',
            'notes' => null,
            'completed_at' => null,
            'cancelled_at' => null,
        ];
    }
}
