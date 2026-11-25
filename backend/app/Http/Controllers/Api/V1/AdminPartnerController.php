<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminPartnerApplicationIndexRequest;
use App\Http\Requests\Admin\RejectPartnerApplicationRequest;
use App\Models\Notification;
use App\Models\Wallet;
use App\Models\Warung;
use App\Models\Withdrawal;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPartnerController extends Controller
{
    public function index(AdminPartnerApplicationIndexRequest $request): JsonResponse
    {
        $query = Warung::with(['owner:id,name,email,phone', 'canteen:id,name'])
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $applications = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan mitra berhasil diambil.',
            'data' => $applications->items(),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    public function approve(Request $request, Warung $warung): JsonResponse
    {
        $admin = $request->user();

        $updated = DB::transaction(function () use ($admin, $warung, $request) {
            $lockedWarung = Warung::where('id', $warung->id)->lockForUpdate()->firstOrFail();

            $lockedWarung->status = 'approved';
            $lockedWarung->rejection_reason = null;
            $lockedWarung->approved_at = now();
            $lockedWarung->approved_by = $admin->id;
            $lockedWarung->save();

            Notification::create([
                'user_id' => $lockedWarung->owner_id,
                'type' => 'partner_application_approved',
                'title' => 'Pengajuan Mitra Disetujui',
                'message' => "Selamat! Warung {$lockedWarung->name} telah disetujui dan kini dapat mulai beroperasi.",
                'data' => [
                    'warung_id' => $lockedWarung->id,
                    'status' => 'approved',
                ],
            ]);

            AuditLogger::log(
                $admin->id,
                'partner_application.approved',
                Warung::class,
                $lockedWarung->id,
                [
                    'warung_name' => $lockedWarung->name,
                    'owner_id' => $lockedWarung->owner_id,
                ],
                $request
            );

            return $lockedWarung;
        });

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan mitra berhasil disetujui.',
            'data' => $updated,
        ]);
    }

    public function reject(RejectPartnerApplicationRequest $request, Warung $warung): JsonResponse
    {
        $admin = $request->user();
        $reason = $request->validated('reason');

        $updated = DB::transaction(function () use ($admin, $warung, $reason, $request) {
            $lockedWarung = Warung::where('id', $warung->id)->lockForUpdate()->firstOrFail();

            $lockedWarung->status = 'rejected';
            $lockedWarung->rejection_reason = $reason;
            $lockedWarung->is_open = false;
            $lockedWarung->save();

            Notification::create([
                'user_id' => $lockedWarung->owner_id,
                'type' => 'partner_application_rejected',
                'title' => 'Pengajuan Mitra Ditolak',
                'message' => "Pengajuan warung {$lockedWarung->name} ditolak. Alasan: {$reason}",
                'data' => [
                    'warung_id' => $lockedWarung->id,
                    'status' => 'rejected',
                    'reason' => $reason,
                ],
            ]);

            AuditLogger::log(
                $admin->id,
                'partner_application.rejected',
                Warung::class,
                $lockedWarung->id,
                [
                    'warung_name' => $lockedWarung->name,
                    'owner_id' => $lockedWarung->owner_id,
                    'reason' => $reason,
                ],
                $request
            );

            return $lockedWarung;
        });

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan mitra berhasil ditolak.',
            'data' => $updated,
        ]);
    }

    public function walletSummary(): JsonResponse
    {
        $platformWallet = Wallet::where('type', Wallet::TYPE_PLATFORM)->first();
        $partnerPendingTotal = (int) Wallet::where('type', Wallet::TYPE_PARTNER)->sum('pending_balance');
        $partnerAvailableTotal = (int) Wallet::where('type', Wallet::TYPE_PARTNER)->sum('available_balance');
        $totalWithdrawn = (int) Withdrawal::where('status', Withdrawal::STATUS_SUCCESS)->sum('amount');

        return response()->json([
            'success' => true,
            'message' => 'Ringkasan dompet platform berhasil diambil.',
            'data' => [
                'platform_balance' => $platformWallet ? $platformWallet->available_balance : 0,
                'total_withdrawn' => $totalWithdrawn,
                'partner_pending_total' => $partnerPendingTotal,
                'partner_available_total' => $partnerAvailableTotal,
            ],
        ]);
    }
}
