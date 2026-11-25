<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\PaymentGateway;
use App\Events\PaymentPaid;
use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class PaymentController extends Controller
{
    public function pay(Order $order, PaymentGateway $gateway): JsonResponse
    {
        Gate::authorize('pay', $order);

        $result = DB::transaction(function () use ($order, $gateway) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->firstOrFail();

            if ($lockedOrder->status !== Order::STATUS_MENUNGGU_PEMBAYARAN) {
                return ['error' => 'Pesanan tidak dalam status menunggu pembayaran.', 'status' => 422];
            }

            Payment::where('order_id', $lockedOrder->id)
                ->where('status', Payment::STATUS_PENDING)
                ->where('expires_at', '<=', now())
                ->update(['status' => Payment::STATUS_EXPIRED]);

            $activePayment = Payment::where('order_id', $lockedOrder->id)
                ->where('status', Payment::STATUS_PENDING)
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            if ($activePayment) {
                return ['payment' => $activePayment, 'created' => false];
            }

            $payment = $gateway->createPayment($lockedOrder);

            return ['payment' => $payment, 'created' => true];
        });

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => $result['error'],
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => $result['created'] ? 'Pembayaran berhasil dibuat.' : 'Pembayaran aktif sudah tersedia.',
            'data' => new PaymentResource($result['payment']),
        ], $result['created'] ? 201 : 200);
    }

    public function status(Order $order): JsonResponse
    {
        Gate::authorize('view', $order);

        $payment = $order->payments()->latest()->first();

        if (! $payment) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran belum ditemukan untuk pesanan ini.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pembayaran berhasil diambil.',
            'data' => new PaymentResource($payment),
        ]);
    }

    public function simulateShow(string $code): JsonResponse
    {
        $payment = Payment::with('order.warung')->where('code', $code)->first();

        if (! $payment) {
            return response()->json([
                'success' => false,
                'message' => 'Data pembayaran tidak ditemukan.',
            ], 404);
        }

        $isExpired = $payment->status === Payment::STATUS_EXPIRED
            || ($payment->status === Payment::STATUS_PENDING && $payment->expires_at !== null && $payment->expires_at->isPast());

        return response()->json([
            'success' => true,
            'message' => 'Detail simulasi pembayaran berhasil diambil.',
            'data' => [
                'code' => $payment->code,
                'warung_name' => $payment->order?->warung?->name,
                'amount' => $payment->amount,
                'status' => $isExpired && $payment->status === Payment::STATUS_PENDING ? Payment::STATUS_EXPIRED : $payment->status,
                'expired' => $isExpired,
                'expires_at' => $payment->expires_at?->toIso8601String(),
                'paid_at' => $payment->paid_at?->toIso8601String(),
            ],
        ]);
    }

    public function simulatePay(string $code): JsonResponse
    {
        if (! config('payment.simulator_enabled')) {
            return response()->json([
                'success' => false,
                'message' => 'Simulator pembayaran sedang dinonaktifkan.',
            ], 403);
        }

        $result = DB::transaction(function () use ($code) {
            $payment = Payment::where('code', $code)->lockForUpdate()->first();

            if (! $payment) {
                return ['error' => 'Data pembayaran tidak ditemukan.', 'status' => 404];
            }

            if ($payment->status !== Payment::STATUS_PENDING) {
                return ['error' => 'Pembayaran sudah diproses atau tidak lagi berlaku.', 'status' => 422];
            }

            if ($payment->expires_at !== null && $payment->expires_at->isPast()) {
                $payment->status = Payment::STATUS_EXPIRED;
                $payment->save();

                return ['error' => 'Pembayaran telah kedaluwarsa.', 'status' => 422];
            }

            $order = Order::where('id', $payment->order_id)->lockForUpdate()->firstOrFail();

            if ($order->status !== Order::STATUS_MENUNGGU_PEMBAYARAN) {
                return ['error' => 'Status pesanan tidak valid untuk pembayaran.', 'status' => 422];
            }

            $payment->status = Payment::STATUS_PAID;
            $payment->paid_at = now();
            $payment->reference = 'SIM-'.strtoupper(bin2hex(random_bytes(8)));
            $payment->save();

            $order->status = Order::STATUS_DIPROSES;
            $order->save();

            PaymentPaid::dispatch($payment);

            return ['payment' => $payment, 'order' => $order];
        });

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => $result['error'],
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dikonfirmasi.',
            'data' => [
                'payment' => new PaymentResource($result['payment']),
                'order_status' => $result['order']->status,
            ],
        ]);
    }
}
