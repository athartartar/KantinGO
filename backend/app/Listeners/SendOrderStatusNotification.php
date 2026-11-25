<?php

namespace App\Listeners;

use App\Events\OrderStatusChanged;
use App\Models\Notification;

class SendOrderStatusNotification
{
    public function handle(OrderStatusChanged $event): void
    {
        $order = $event->order;

        Notification::create([
            'user_id' => $order->user_id,
            'type' => 'order_status_changed',
            'title' => 'Status Pesanan Diperbarui',
            'message' => "Pesanan {$order->order_code} kini berstatus {$order->status}.",
            'data' => [
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'status' => $order->status,
            ],
        ]);
    }
}
