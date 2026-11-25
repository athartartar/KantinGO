<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\ToggleWarungOpenRequest;
use App\Http\Requests\Partner\UpdateWarungRequest;
use App\Http\Resources\WarungResource;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PartnerWarungController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $warung = $request->user()->warung()->with('canteen')->firstOrFail();
        Gate::authorize('view', $warung);

        return response()->json([
            'success' => true,
            'message' => 'Profil warung berhasil diambil.',
            'data' => new WarungResource($warung),
        ]);
    }

    public function update(UpdateWarungRequest $request): JsonResponse
    {
        $warung = $request->user()->warung()->firstOrFail();
        Gate::authorize('update', $warung);

        $warung->fill($request->validated());
        $warung->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil warung berhasil diperbarui.',
            'data' => new WarungResource($warung->load('canteen')),
        ]);
    }

    public function toggleOpen(ToggleWarungOpenRequest $request): JsonResponse
    {
        $warung = $request->user()->warung()->firstOrFail();
        Gate::authorize('update', $warung);

        $warung->is_open = (bool) $request->validated('is_open');
        $warung->save();

        return response()->json([
            'success' => true,
            'message' => $warung->is_open ? 'Warung sekarang buka.' : 'Warung sekarang tutup.',
            'data' => new WarungResource($warung),
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $warung = $user->warung()->firstOrFail();
        Gate::authorize('view', $warung);

        $todayOrdersQuery = Order::where('warung_id', $warung->id)
            ->whereDate('created_at', today())
            ->where(function ($q) {
                $q->whereIn('status', [
                    Order::STATUS_DIPROSES,
                    Order::STATUS_SIAP,
                    Order::STATUS_SELESAI,
                ])->orWhereHas('payments', fn ($pq) => $pq->where('status', Payment::STATUS_PAID));
            });

        $ordersToday = (clone $todayOrdersQuery)->count();
        $revenueToday = (int) (clone $todayOrdersQuery)
            ->where('status', '!=', Order::STATUS_DIBATALKAN)
            ->sum('total');

        $wallet = Wallet::where('type', Wallet::TYPE_PARTNER)
            ->where('user_id', $user->id)
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Statistik warung berhasil diambil.',
            'data' => [
                'orders_today' => $ordersToday,
                'revenue_today' => $revenueToday,
                'pending_balance' => $wallet?->pending_balance ?? 0,
                'available_balance' => $wallet?->available_balance ?? 0,
            ],
        ]);
    }
}
