<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGateway;
use App\Models\Order;
use App\Models\Payment;

class SimulatorPaymentGateway implements PaymentGateway
{
    public function createPayment(Order $order): Payment
    {
        $code = bin2hex(random_bytes(20));
        $expiresAt = now()->addMinutes((int) config('payment.expiry_minutes', 15));
        $frontendUrl = rtrim((string) config('payment.frontend_url', 'http://localhost:5173'), '/');

        return Payment::create([
            'order_id' => $order->id,
            'code' => $code,
            'method' => 'qris',
            'amount' => $order->total,
            'status' => Payment::STATUS_PENDING,
            'qris_payload' => "{$frontendUrl}/simulasi-bayar/{$code}",
            'reference' => null,
            'expires_at' => $expiresAt,
            'paid_at' => null,
        ]);
    }
}
