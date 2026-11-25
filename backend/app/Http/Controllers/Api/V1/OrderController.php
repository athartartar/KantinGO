<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\OrderCompleted;
use App\Events\OrderStatusChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\OrderIndexRequest;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Menu;
use App\Models\MenuAddon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\UserVoucher;
use App\Models\Voucher;
use App\Models\Warung;
use App\Services\Audit\AuditLogger;
use App\Services\Wallet\WalletService;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(OrderIndexRequest $request): JsonResponse
    {
        $query = Order::with(['warung', 'items', 'payment'])
            ->where('user_id', $request->user()->id)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan berhasil diambil.',
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $idempotencyKey = trim((string) $request->header('Idempotency-Key', ''));

        if (strlen($idempotencyKey) > 100) {
            throw ValidationException::withMessages([
                'idempotency_key' => ['Header Idempotency-Key maksimal 100 karakter.'],
            ]);
        }

        if ($idempotencyKey !== '') {
            $existingOrder = Order::with(['warung', 'items', 'payment'])
                ->where('user_id', $user->id)
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($existingOrder) {
                return response()->json([
                    'success' => true,
                    'message' => 'Pesanan sudah dibuat sebelumnya.',
                    'data' => new OrderResource($existingOrder),
                ], 200);
            }
        }

        try {
            $order = DB::transaction(function () use ($user, $validated, $idempotencyKey) {
                $menuIds = collect($validated['items'])->pluck('menu_id')->unique()->values();
                $menus = Menu::with('warung')->whereIn('id', $menuIds)->get()->keyBy('id');

                if ($menus->count() !== $menuIds->count()) {
                    throw ValidationException::withMessages([
                        'items' => ['Sebagian menu tidak ditemukan.'],
                    ]);
                }

                foreach ($menus as $menu) {
                    if (! $menu->is_available) {
                        throw ValidationException::withMessages([
                            'items' => ["Menu {$menu->name} sedang tidak tersedia."],
                        ]);
                    }
                }

                $warungIds = $menus->pluck('warung_id')->unique();
                if ($warungIds->count() !== 1) {
                    throw ValidationException::withMessages([
                        'items' => ['Satu pesanan hanya boleh berasal dari satu warung.'],
                    ]);
                }

                $warung = Warung::where('id', $warungIds->first())->lockForUpdate()->firstOrFail();

                if ($warung->status !== 'approved' || ! $warung->is_open) {
                    throw ValidationException::withMessages([
                        'warung' => ['Warung sedang tutup atau belum disetujui.'],
                    ]);
                }

                $this->validatePickupTime($validated['pickup_time'], $warung->opening_hours);

                $subtotal = 0;
                $orderItemsData = [];

                foreach ($validated['items'] as $item) {
                    $menu = $menus->get((int) $item['menu_id']);
                    $qty = (int) $item['qty'];
                    $addonIds = array_values(array_unique(array_map('intval', $item['addon_id'] ?? [])));

                    $addons = collect();
                    if ($addonIds !== []) {
                        $addons = MenuAddon::whereIn('id', $addonIds)
                            ->where('menu_id', $menu->id)
                            ->where('is_available', true)
                            ->get();

                        if ($addons->count() !== count($addonIds)) {
                            throw ValidationException::withMessages([
                                'items' => ["Addon tidak valid atau tidak tersedia untuk menu {$menu->name}."],
                            ]);
                        }
                    }

                    $addonPriceSum = (int) $addons->sum('additional_price');
                    $unitPrice = $menu->price + $addonPriceSum;
                    $itemSubtotal = $unitPrice * $qty;
                    $subtotal += $itemSubtotal;

                    $orderItemsData[] = [
                        'menu_id' => $menu->id,
                        'menu_name' => $menu->name,
                        'menu_image' => $menu->image_path,
                        'quantity' => $qty,
                        'unit_price' => $unitPrice,
                        'addons_snapshot' => $addons->map(fn (MenuAddon $addon) => [
                            'id' => $addon->id,
                            'option_name' => $addon->option_name,
                            'additional_price' => $addon->additional_price,
                        ])->values()->all(),
                        'notes' => null,
                        'subtotal' => $itemSubtotal,
                    ];
                }

                $discount = 0;
                $voucherId = null;

                if (! empty($validated['voucher_code'])) {
                    $voucherCode = trim($validated['voucher_code']);
                    $voucher = Voucher::where('code', $voucherCode)->lockForUpdate()->first();

                    if (! $voucher || ! $voucher->is_active) {
                        throw ValidationException::withMessages([
                            'voucher_code' => ['Kode voucher tidak valid atau tidak aktif.'],
                        ]);
                    }

                    $now = now();
                    if (($voucher->valid_from && $now->lt($voucher->valid_from))
                        || ($voucher->valid_until && $now->gt($voucher->valid_until))) {
                        throw ValidationException::withMessages([
                            'voucher_code' => ['Voucher sudah kedaluwarsa atau belum berlaku.'],
                        ]);
                    }

                    if ($voucher->quota !== null && $voucher->used_count >= $voucher->quota) {
                        throw ValidationException::withMessages([
                            'voucher_code' => ['Kuota voucher sudah habis.'],
                        ]);
                    }

                    if ($subtotal < $voucher->min_spend) {
                        throw ValidationException::withMessages([
                            'voucher_code' => ["Minimal belanja untuk voucher ini adalah Rp {$voucher->min_spend}."],
                        ]);
                    }

                    $userVoucher = UserVoucher::where('user_id', $user->id)
                        ->where('voucher_id', $voucher->id)
                        ->lockForUpdate()
                        ->first();

                    if ($userVoucher && $userVoucher->status === 'used') {
                        throw ValidationException::withMessages([
                            'voucher_code' => ['Voucher sudah pernah digunakan.'],
                        ]);
                    }

                    if ($voucher->type === 'persen') {
                        $discount = (int) floor($subtotal * $voucher->value / 100);
                        if ($voucher->max_discount !== null) {
                            $discount = min($discount, $voucher->max_discount);
                        }
                    } else {
                        $discount = $voucher->value;
                    }

                    $discount = min($discount, $subtotal);
                    $voucherId = $voucher->id;

                    $alreadyClaimed = $userVoucher !== null && $userVoucher->status === 'active';

                    UserVoucher::updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'voucher_id' => $voucher->id,
                        ],
                        [
                            'status' => 'used',
                            'claimed_at' => $userVoucher ? $userVoucher->claimed_at : $now,
                            'used_at' => $now,
                        ]
                    );

                    if (! $alreadyClaimed) {
                        $voucher->increment('used_count');
                    }
                }

                $serviceFee = Order::SERVICE_FEE;
                $total = max(0, $subtotal - $discount + $serviceFee);

                $order = Order::create([
                    'order_code' => 'KGO-'.strtoupper(bin2hex(random_bytes(5))),
                    'user_id' => $user->id,
                    'warung_id' => $warung->id,
                    'voucher_id' => $voucherId,
                    'pickup_time' => $validated['pickup_time'],
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'service_fee' => $serviceFee,
                    'total' => $total,
                    'status' => Order::STATUS_MENUNGGU_PEMBAYARAN,
                    'notes' => null,
                    'idempotency_key' => $idempotencyKey !== '' ? $idempotencyKey : null,
                ]);

                foreach ($orderItemsData as $itemData) {
                    $order->items()->create($itemData);
                }

                return $order->load(['warung', 'items', 'payment']);
            });
        } catch (QueryException $e) {
            if ($e->getCode() === '23000' && $idempotencyKey !== '') {
                $existingOrder = Order::with(['warung', 'items', 'payment'])
                    ->where('user_id', $user->id)
                    ->where('idempotency_key', $idempotencyKey)
                    ->first();

                if ($existingOrder) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Pesanan sudah dibuat sebelumnya.',
                        'data' => new OrderResource($existingOrder),
                    ], 200);
                }
            }

            throw $e;
        }

        AuditLogger::log($user->id, 'order.created', Order::class, $order->id, [
            'order_code' => $order->order_code,
            'warung_id' => $order->warung_id,
            'total' => $order->total,
        ], $request);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat.',
            'data' => new OrderResource($order),
        ], 201);
    }

    public function show(Order $order): JsonResponse
    {
        Gate::authorize('view', $order);

        return response()->json([
            'success' => true,
            'message' => 'Detail pesanan berhasil diambil.',
            'data' => new OrderResource($order->load(['warung', 'items', 'payment'])),
        ]);
    }

    public function cancel(Order $order, WalletService $walletService): JsonResponse
    {
        Gate::authorize('cancel', $order);

        $updatedOrder = DB::transaction(function () use ($order, $walletService) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->firstOrFail();

            if (! in_array($lockedOrder->status, [
                Order::STATUS_MENUNGGU_PEMBAYARAN,
                Order::STATUS_DIPROSES,
            ], true)) {
                return null;
            }

            $previousStatus = $lockedOrder->status;
            $lockedOrder->status = Order::STATUS_DIBATALKAN;
            $lockedOrder->cancelled_at = now();
            $lockedOrder->save();

            $lockedOrder->payments()
                ->where('status', Payment::STATUS_PENDING)
                ->update(['status' => Payment::STATUS_EXPIRED]);

            if ($previousStatus === Order::STATUS_DIPROSES) {
                $paidPayment = Payment::where('order_id', $lockedOrder->id)
                    ->where('status', Payment::STATUS_PAID)
                    ->lockForUpdate()
                    ->first();

                if ($paidPayment) {
                    $walletService->refundOnOrderCancelled($lockedOrder, $paidPayment);
                }
            }

            OrderStatusChanged::dispatch($lockedOrder);

            return $lockedOrder->load(['warung', 'items', 'payment']);
        });

        if (! $updatedOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dibatalkan pada status saat ini.',
            ], 422);
        }

        AuditLogger::log(request()->user()?->id, 'order.cancelled', Order::class, $updatedOrder->id, [
            'order_code' => $updatedOrder->order_code,
            'status' => $updatedOrder->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan.',
            'data' => new OrderResource($updatedOrder),
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

    public function confirmPickup(Order $order, WalletService $walletService): JsonResponse
    {
        Gate::authorize('confirmPickup', $order);

        $updatedOrder = DB::transaction(function () use ($order, $walletService) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->firstOrFail();

            if ($lockedOrder->status !== Order::STATUS_SIAP) {
                return null;
            }

            $lockedOrder->status = Order::STATUS_SELESAI;
            $lockedOrder->completed_at = now();
            $lockedOrder->save();

            $walletService->releaseOnOrderCompleted($lockedOrder);
            OrderCompleted::dispatch($lockedOrder);
            OrderStatusChanged::dispatch($lockedOrder);

            return $lockedOrder->load(['warung', 'items', 'payment']);
        });

        if (! $updatedOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan belum siap diambil atau sudah selesai.',
            ], 422);
        }

        AuditLogger::log(request()->user()?->id, 'order.completed', Order::class, $updatedOrder->id, [
            'order_code' => $updatedOrder->order_code,
            'status' => $updatedOrder->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dikonfirmasi selesai.',
            'data' => new OrderResource($updatedOrder),
        ]);
    }

    private function validatePickupTime(string $pickupTime, ?string $openingHours): void
    {
        try {
            $pickupAt = Carbon::parse($pickupTime);
        } catch (\Throwable) {
            throw ValidationException::withMessages([
                'pickup_time' => ['Format waktu pengambilan tidak valid.'],
            ]);
        }

        if (! $pickupAt->gt(now())) {
            throw ValidationException::withMessages([
                'pickup_time' => ['Waktu pengambilan harus di masa depan.'],
            ]);
        }

        if ($openingHours && preg_match('/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/', $openingHours, $matches)) {
            $openTime = $matches[1];
            $closeTime = $matches[2];
            $pickupClock = $pickupAt->format('H:i');

            if ($pickupClock < $openTime || $pickupClock > $closeTime) {
                throw ValidationException::withMessages([
                    'pickup_time' => ["Waktu pengambilan harus dalam jam buka warung ({$openingHours})."],
                ]);
            }
        }
    }
}
