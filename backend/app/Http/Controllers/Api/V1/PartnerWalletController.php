<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\StoreWithdrawalRequest;
use App\Http\Requests\Partner\UpdateBankAccountRequest;
use App\Http\Resources\WalletTransactionResource;
use App\Http\Resources\WithdrawalResource;
use App\Models\PartnerBankAccount;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Services\Audit\AuditLogger;
use App\Services\Wallet\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PartnerWalletController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        Gate::authorize('managePartner', Wallet::class);

        $user = $request->user();
        $wallet = Wallet::where('type', Wallet::TYPE_PARTNER)
            ->where('user_id', $user->id)
            ->first();

        $bankAccount = PartnerBankAccount::where('user_id', $user->id)->first();
        $perPage = min((int) $request->input('per_page', 15), 50);

        $transactions = $wallet
            ? $wallet->transactions()->latest('id')->paginate($perPage)
            : null;

        return response()->json([
            'success' => true,
            'message' => 'Data dompet mitra berhasil diambil.',
            'data' => [
                'pending_balance' => $wallet ? $wallet->pending_balance : 0,
                'available_balance' => $wallet ? $wallet->available_balance : 0,
                'bank_account' => $bankAccount ? [
                    'bank_name' => $bankAccount->bank_name,
                    'account_holder' => $bankAccount->account_holder,
                    'account_number_masked' => $bankAccount->maskedAccountNumber(),
                ] : null,
                'transactions' => $transactions ? WalletTransactionResource::collection($transactions->items()) : [],
            ],
            'meta' => [
                'current_page' => $transactions?->currentPage() ?? 1,
                'last_page' => $transactions?->lastPage() ?? 1,
                'per_page' => $transactions?->perPage() ?? $perPage,
                'total' => $transactions?->total() ?? 0,
            ],
        ]);
    }

    public function updateBankAccount(UpdateBankAccountRequest $request): JsonResponse
    {
        Gate::authorize('managePartner', Wallet::class);

        $user = $request->user();
        $validated = $request->validated();

        $bankAccount = PartnerBankAccount::updateOrCreate(
            ['user_id' => $user->id],
            [
                'bank_name' => $validated['bank_name'],
                'account_holder' => $validated['account_holder'],
                'account_number' => $validated['account_number'],
            ]
        );

        AuditLogger::log($user->id, 'bank_account.updated', PartnerBankAccount::class, $bankAccount->id, [
            'bank_name' => $bankAccount->bank_name,
            'account_number_masked' => $bankAccount->maskedAccountNumber(),
        ], $request);

        return response()->json([
            'success' => true,
            'message' => 'Rekening bank berhasil disimpan.',
            'data' => [
                'bank_name' => $bankAccount->bank_name,
                'account_holder' => $bankAccount->account_holder,
                'account_number_masked' => $bankAccount->maskedAccountNumber(),
            ],
        ]);
    }

    public function withdraw(StoreWithdrawalRequest $request, WalletService $walletService): JsonResponse
    {
        Gate::authorize('managePartner', Wallet::class);

        $result = $walletService->withdraw(
            $request->user(),
            (int) $request->validated('amount'),
            $request->header('Idempotency-Key')
        );

        if ($result['created']) {
            AuditLogger::log(
                $request->user()->id,
                'withdrawal.created',
                Withdrawal::class,
                $result['withdrawal']->id,
                [
                    'amount' => $result['withdrawal']->amount,
                    'reference' => $result['withdrawal']->reference,
                ],
                $request
            );
        }

        return response()->json([
            'success' => true,
            'message' => $result['created'] ? 'Penarikan dana berhasil diproses.' : 'Penarikan dana sudah diproses sebelumnya.',
            'data' => new WithdrawalResource($result['withdrawal']),
        ], $result['created'] ? 201 : 200);
    }

    public function withdrawals(Request $request): JsonResponse
    {
        Gate::authorize('managePartner', Wallet::class);

        $perPage = min((int) $request->input('per_page', 15), 50);
        $withdrawals = Withdrawal::where('user_id', $request->user()->id)
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat penarikan dana berhasil diambil.',
            'data' => WithdrawalResource::collection($withdrawals->items()),
            'meta' => [
                'current_page' => $withdrawals->currentPage(),
                'last_page' => $withdrawals->lastPage(),
                'per_page' => $withdrawals->perPage(),
                'total' => $withdrawals->total(),
            ],
        ]);
    }
}
