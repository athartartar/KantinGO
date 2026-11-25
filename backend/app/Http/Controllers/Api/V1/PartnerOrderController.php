<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\OrderStatusChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Requests\Partner\PartnerOrderIndexRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Warung;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class PartnerOrderController extends Controller
{
    public function index(PartnerOrderIndexRequest $request): JsonResponse
    {
        $warung = Warung::where('owner_id', $request->user()->id)->firstOrFail();
        Gate::authorize('view', $warung);

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

        AuditLogger::log($request->user()?->id, 'order.status_updated', Order::class, $updatedOrder->id, [
            'order_code' => $updatedOrder->order_code,
            'status' => $updatedOrder->status,
        ], $request);

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui.',
            'data' => new OrderResource($updatedOrder),
        ]);
    }
}
