<?php

namespace App\Console\Commands;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Console\Command;

class ReconcileWalletsCommand extends Command
{
    protected $signature = 'wallet:reconcile';

    protected $description = 'Rekonsiliasi saldo dompet dengan catatan ledger wallet_transactions';

    public function handle(): int
    {
        $mismatches = 0;

        $wallets = Wallet::all();

        foreach ($wallets as $wallet) {
            $sums = WalletTransaction::where('wallet_id', $wallet->id)
                ->selectRaw('type, COALESCE(SUM(amount), 0) as total_amount')
                ->groupBy('type')
                ->pluck('total_amount', 'type');

            $paymentIn = (int) ($sums[WalletTransaction::TYPE_PAYMENT_IN] ?? 0);
            $hold = (int) ($sums[WalletTransaction::TYPE_HOLD] ?? 0);
            $release = (int) ($sums[WalletTransaction::TYPE_RELEASE] ?? 0);
            $refund = (int) ($sums[WalletTransaction::TYPE_REFUND] ?? 0);
            $withdrawal = (int) ($sums[WalletTransaction::TYPE_WITHDRAWAL] ?? 0);
            $fee = (int) ($sums[WalletTransaction::TYPE_FEE] ?? 0);

            if ($wallet->type === Wallet::TYPE_PLATFORM) {
                $expectedPending = 0;
                $expectedAvailable = $paymentIn + $fee - $refund;
            } else {
                $expectedPending = $hold - $release - $refund;
                $expectedAvailable = $release - $withdrawal;
            }

            if ($wallet->pending_balance !== $expectedPending || $wallet->available_balance !== $expectedAvailable) {
                $mismatches++;
                $this->error("Ketidakcocokan pada dompet #{$wallet->id} ({$wallet->type}): tersimpan pending={$wallet->pending_balance}, available={$wallet->available_balance}; ledger pending={$expectedPending}, available={$expectedAvailable}.");
            }
        }

        if ($mismatches > 0) {
            return self::FAILURE;
        }

        $this->info("Rekonsiliasi selesai: {$wallets->count()} dompet cocok dengan ledger.");

        return self::SUCCESS;
    }
}
