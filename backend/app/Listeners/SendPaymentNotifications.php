<?php

namespace App\Listeners;

use App\Events\PaymentPaid;
use App\Models\Notification;
use App\Models\Order;

class SendPaymentNotifications
{
    public function handle(PaymentPaid $event): void
    {
        $order = Order::with('warung')->find($event->payment->order_id);

        if (! $order) {
            return;
        }

        Notification::create([
            'user_id' => $order->user_id,
            'type' => 'payment_paid',
            'title' => 'Pembayaran Berhasil',
            'message' => "Pembayaran untuk pesanan {$order->order_code} telah berhasil.",
            'data' => [
                'order_id' => $order->id,
                'order_code' => $order->order_code,
            ],
        ]);

        if ($order->warung) {
            Notification::create([
                'user_id' => $order->warung->owner_id,
                'type' => 'new_paid_order',
                'title' => 'Pesanan Baru Dibayar',
                'message' => "Pesanan baru {$order->order_code} telah dibayar dan siap diproses.",
                'data' => [
                    'order_id' => $order->id,
                    'order_code' => $order->order_code,
                ],
            ]);
        }
    }
}
