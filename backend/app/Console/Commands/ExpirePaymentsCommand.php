<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpirePaymentsCommand extends Command
{
    protected $signature = 'payments:expire';

    protected $description = 'Kedaluwarsakan pembayaran pending yang melewati batas waktu dan batalkan pesanan yang belum dibayar';

    public function handle(): int
    {
        $expiredCount = 0;

        $paymentIds = Payment::where('status', Payment::STATUS_PENDING)
            ->where('expires_at', '<=', now())
            ->pluck('id');

        foreach ($paymentIds as $paymentId) {
            $processed = DB::transaction(function () use ($paymentId) {
                $payment = Payment::where('id', $paymentId)->lockForUpdate()->first();

                if (! $payment || $payment->status !== Payment::STATUS_PENDING || ($payment->expires_at !== null && Carbon::parse($payment->expires_at)->gt(now()))) {
                    return false;
                }

                $payment->status = Payment::STATUS_EXPIRED;
                $payment->save();

                $order = Order::where('id', $payment->order_id)->lockForUpdate()->first();
                if ($order && $order->status === Order::STATUS_MENUNGGU_PEMBAYARAN) {
                    $order->status = Order::STATUS_DIBATALKAN;
                    $order->cancelled_at = now();
                    $order->save();
                }

                return true;
            });

            if ($processed) {
                $expiredCount++;
            }
        }

        $this->info("Berhasil memproses {$expiredCount} pembayaran kedaluwarsa.");

        return self::SUCCESS;
    }
}
