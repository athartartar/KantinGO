<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Voucher\ClaimVoucherRequest;
use App\Http\Requests\Voucher\RedeemVoucherRequest;
use App\Http\Resources\UserVoucherResource;
use App\Http\Resources\VoucherResource;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserVoucher;
use App\Models\Voucher;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class VoucherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Voucher::class);

        $now = now();
        $perPage = min((int) $request->input('per_page', 15), 50);

        $vouchers = Voucher::where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('valid_from')->orWhere('valid_from', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', $now);
            })
            ->where(function ($q) {
                $q->whereNull('quota')->orWhereColumn('used_count', '<', 'quota');
            })
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar voucher berhasil diambil.',
            'data' => VoucherResource::collection($vouchers->items()),
            'meta' => [
                'current_page' => $vouchers->currentPage(),
                'last_page' => $vouchers->lastPage(),
                'per_page' => $vouchers->perPage(),
                'total' => $vouchers->total(),
            ],
        ]);
    }

    public function myVouchers(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Voucher::class);

        $request->validate([
            'status' => ['nullable', 'string', Rule::in(['active', 'used', 'expired'])],
        ]);

        $query = UserVoucher::with('voucher')
            ->where('user_id', $request->user()->id)
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $userVouchers = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar voucher Anda berhasil diambil.',
            'data' => UserVoucherResource::collection($userVouchers->items()),
            'meta' => [
                'current_page' => $userVouchers->currentPage(),
                'last_page' => $userVouchers->lastPage(),
                'per_page' => $userVouchers->perPage(),
                'total' => $userVouchers->total(),
            ],
        ]);
    }

    public function redeem(RedeemVoucherRequest $request): JsonResponse
    {
        Gate::authorize('redeem', Voucher::class);

        $user = $request->user();
        $code = trim($request->validated('code'));

        $userVoucher = DB::transaction(function () use ($user, $code) {
            $voucher = Voucher::where('code', $code)->lockForUpdate()->first();

            $this->ensureVoucherAvailable($voucher);

            $existing = UserVoucher::where('user_id', $user->id)
                ->where('voucher_id', $voucher->id)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                throw ValidationException::withMessages([
                    'code' => ['Voucher sudah pernah diklaim atau digunakan.'],
                ]);
            }

            $userVoucher = UserVoucher::create([
                'user_id' => $user->id,
                'voucher_id' => $voucher->id,
                'status' => 'active',
                'claimed_at' => now(),
                'used_at' => null,
            ]);

            $voucher->increment('used_count');

            return $userVoucher->load('voucher');
        });

        AuditLogger::log($user->id, 'voucher.redeemed', Voucher::class, $userVoucher->voucher_id, [
            'code' => $code,
        ], $request);

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil diklaim.',
            'data' => new UserVoucherResource($userVoucher),
        ], 201);
    }

    public function claim(ClaimVoucherRequest $request, Voucher $voucher): JsonResponse
    {
        Gate::authorize('claim', $voucher);

        $user = $request->user();

        $result = DB::transaction(function () use ($user, $voucher) {
            $lockedVoucher = Voucher::where('id', $voucher->id)->lockForUpdate()->firstOrFail();

            $this->ensureVoucherAvailable($lockedVoucher);

            $existing = UserVoucher::where('user_id', $user->id)
                ->where('voucher_id', $lockedVoucher->id)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                throw ValidationException::withMessages([
                    'voucher' => ['Voucher sudah pernah diklaim atau digunakan.'],
                ]);
            }

            $lockedUser = User::where('id', $user->id)->lockForUpdate()->firstOrFail();
            $cost = (int) $lockedVoucher->points_cost;

            if ($lockedUser->points < $cost) {
                throw ValidationException::withMessages([
                    'points' => ['Poin Anda tidak mencukupi untuk menukar voucher ini.'],
                ]);
            }

            $lockedUser->points -= $cost;
            $lockedUser->save();

            PointTransaction::create([
                'user_id' => $lockedUser->id,
                'order_id' => null,
                'type' => 'redeem',
                'amount' => -$cost,
                'balance_after' => $lockedUser->points,
                'description' => "Tukar poin untuk voucher {$lockedVoucher->code}",
            ]);

            $userVoucher = UserVoucher::create([
                'user_id' => $lockedUser->id,
                'voucher_id' => $lockedVoucher->id,
                'status' => 'active',
                'claimed_at' => now(),
                'used_at' => null,
            ]);

            $lockedVoucher->increment('used_count');

            return [
                'user_voucher' => $userVoucher->load('voucher'),
                'points_remaining' => $lockedUser->points,
            ];
        });

        AuditLogger::log($user->id, 'voucher.claimed', Voucher::class, $voucher->id, [
            'code' => $voucher->code,
            'points_cost' => $voucher->points_cost,
        ], $request);

        return response()->json([
            'success' => true,
            'message' => 'Poin berhasil ditukar menjadi voucher.',
            'data' => [
                'user_voucher' => new UserVoucherResource($result['user_voucher']),
                'points_remaining' => $result['points_remaining'],
            ],
        ], 201);
    }

    private function ensureVoucherAvailable(?Voucher $voucher): void
    {
        if (! $voucher || ! $voucher->is_active) {
            throw ValidationException::withMessages([
                'code' => ['Voucher tidak valid atau tidak aktif.'],
            ]);
        }

        $now = now();
        if (($voucher->valid_from && $now->lt($voucher->valid_from))
            || ($voucher->valid_until && $now->gt($voucher->valid_until))) {
            throw ValidationException::withMessages([
                'code' => ['Voucher sudah kedaluwarsa atau belum berlaku.'],
            ]);
        }

        if ($voucher->quota !== null && $voucher->used_count >= $voucher->quota) {
            throw ValidationException::withMessages([
                'code' => ['Kuota voucher sudah habis.'],
            ]);
        }
    }
}
