<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\OrderStatusChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class PartnerOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => ['nullable', 'string', Rule::in([
                Order::STATUS_DIPROSES,
                Order::STATUS_SIAP,
                Order::STATUS_SELESAI,
                Order::STATUS_DIBATALKAN,
            ])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ], [
            'status.in' => 'Filter status pesanan mitra tidak valid.',
        ]);

        $warung = $request->user()->warung()->firstOrFail();

        $query = Order::with(['items', 'payment', 'warung'])
            ->where('warung_id', $warung->id)
            ->where('status', '!=', Order::STATUS_MENUNGGU_PEMBAYARAN)
            ->where(function ($q) {
                $q->whereIn('status', [
                    Order::STATUS_DIPROSES,
                    Order::STATUS_SIAP,
                    Order::STATUS_SELESAI,
                ])->orWhereHas('payments', fn ($pq) => $pq->whereIn('status', [
                    Payment::STATUS_PAID,
                    Payment::STATUS_REFUNDED,
                ]));
            })
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan masuk berhasil diambil.',
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        Gate::authorize('updateStatus', $order);

        $targetStatus = $request->validated('status');

        $updatedOrder = DB::transaction(function () use ($order, $targetStatus) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->firstOrFail();

            if ($lockedOrder->status !== Order::STATUS_DIPROSES || $targetStatus !== Order::STATUS_SIAP) {
                return null;
            }

            $lockedOrder->status = Order::STATUS_SIAP;
            $lockedOrder->save();

            OrderStatusChanged::dispatch($lockedOrder);

            return $lockedOrder->load(['warung', 'items', 'payment']);
        });

        if (! $updatedOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Transisi status pesanan tidak diizinkan.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui.',
            'data' => new OrderResource($updatedOrder),
        ]);
    }
}
