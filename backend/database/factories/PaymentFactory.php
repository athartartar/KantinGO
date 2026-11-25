<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'payment_code' => 'PAY-'.strtoupper(Str::random(10)),
            'method' => 'qris',
            'amount' => fake()->numberBetween(15, 50) * 1000,
            'status' => 'pending',
            'qris_payload' => '00020101021226580014ID.CO.QRIS.WWW',
            'provider_reference' => null,
            'expires_at' => now()->addMinutes(15),
            'paid_at' => null,
        ];
    }
}
