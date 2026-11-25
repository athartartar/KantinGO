<?php

namespace App\Listeners;

use App\Events\OrderCompleted;
use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AwardPointsOnOrderCompleted
{
    public function handle(OrderCompleted $event): void
    {
        DB::transaction(function () use ($event) {
            $order = Order::where('id', $event->order->id)->lockForUpdate()->first();

            if (! $order || $order->status !== Order::STATUS_SELESAI) {
                return;
            }

            $alreadyAwarded = PointTransaction::where('order_id', $order->id)
                ->where('type', 'earn')
                ->exists();

            if ($alreadyAwarded) {
                return;
            }

            $earnedPoints = max(1, (int) floor($order->total / 1000));

            $user = User::where('id', $order->user_id)->lockForUpdate()->firstOrFail();
            $user->points += $earnedPoints;
            $user->save();

            PointTransaction::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'type' => 'earn',
                'amount' => $earnedPoints,
                'balance_after' => $user->points,
                'description' => "Poin dari pesanan {$order->order_code}",
            ]);
        });
    }
}
