<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        $code = bin2hex(random_bytes(20));

        return [
            'order_id' => Order::factory(),
            'code' => $code,
            'method' => 'qris',
            'amount' => fake()->numberBetween(15, 50) * 1000,
            'status' => 'pending',
            'qris_payload' => rtrim((string) config('payment.frontend_url', 'http://localhost:5173'), '/').'/simulasi-bayar/'.$code,
            'reference' => null,
            'expires_at' => now()->addMinutes(15),
            'paid_at' => null,
        ];
    }
}
