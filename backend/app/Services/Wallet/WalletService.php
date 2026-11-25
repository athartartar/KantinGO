<?php

namespace App\Services\Wallet;

use App\Models\Order;
use App\Models\PartnerBankAccount;
use App\Models\Payment;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class WalletService
{
    public function getOrCreatePlatformWallet(): Wallet
    {
        $wallet = Wallet::where('type', Wallet::TYPE_PLATFORM)
            ->whereNull('user_id')
            ->lockForUpdate()
            ->first();

        if ($wallet) {
            return $wallet;
        }

        return Wallet::create([
            'type' => Wallet::TYPE_PLATFORM,
            'user_id' => null,
            'pending_balance' => 0,
            'available_balance' => 0,
        ]);
    }

    public function getOrCreatePartnerWallet(int $userId): Wallet
    {
        $wallet = Wallet::where('type', Wallet::TYPE_PARTNER)
            ->where('user_id', $userId)
            ->lockForUpdate()
            ->first();

        if ($wallet) {
            return $wallet;
        }

        try {
            return Wallet::create([
                'type' => Wallet::TYPE_PARTNER,
                'user_id' => $userId,
                'pending_balance' => 0,
                'available_balance' => 0,
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return Wallet::where('type', Wallet::TYPE_PARTNER)
                    ->where('user_id', $userId)
                    ->lockForUpdate()
                    ->firstOrFail();
            }

            throw $e;
        }
    }

    public function creditOnPaymentPaid(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $order = Order::with('warung')->where('id', $payment->order_id)->lockForUpdate()->firstOrFail();

            $alreadyCredited = WalletTransaction::where('order_id', $order->id)
                ->where('type', WalletTransaction::TYPE_HOLD)
                ->exists();

            if ($alreadyCredited) {
                return;
            }

            $total = (int) $order->total;
            $feePercent = max(0.0, (float) config('wallet.platform_fee_percent', 0));
            $fee = (int) floor($total * $feePercent / 100);
            $partnerShare = max(0, $total - $fee);

            $platformWallet = $this->getOrCreatePlatformWallet();
            $platformWallet->available_balance += $total;
            $platformWallet->save();

            WalletTransaction::create([
                'wallet_id' => $platformWallet->id,
                'type' => WalletTransaction::TYPE_PAYMENT_IN,
                'amount' => $total,
                'balance_after' => $platformWallet->pending_balance + $platformWallet->available_balance,
                'order_id' => $order->id,
                'withdrawal_id' => null,
                'reference' => 'WTX-'.strtoupper(bin2hex(random_bytes(10))),
            ]);

            $partnerWallet = $this->getOrCreatePartnerWallet($order->warung->owner_id);
            $partnerWallet->pending_balance += $partnerShare;
            $partnerWallet->save();

            WalletTransaction::create([
                'wallet_id' => $partnerWallet->id,
                'type' => WalletTransaction::TYPE_HOLD,
                'amount' => $partnerShare,
                'balance_after' => $partnerWallet->pending_balance + $partnerWallet->available_balance,
                'order_id' => $order->id,
                'withdrawal_id' => null,
                'reference' => 'WTX-'.strtoupper(bin2hex(random_bytes(10))),
            ]);
        });
    }

    public function releaseOnOrderCompleted(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $alreadyReleased = WalletTransaction::where('order_id', $order->id)
                ->where('type', WalletTransaction::TYPE_RELEASE)
                ->exists();

            if ($alreadyReleased) {
                return;
            }

            $holdTx = WalletTransaction::where('order_id', $order->id)
                ->where('type', WalletTransaction::TYPE_HOLD)
                ->first();

            if (! $holdTx) {
                return;
            }

            $partnerWallet = Wallet::where('id', $holdTx->wallet_id)->lockForUpdate()->firstOrFail();
            $amount = (int) $holdTx->amount;

            if ($partnerWallet->pending_balance < $amount) {
                throw new RuntimeException('Saldo tertahan tidak mencukupi untuk pelepasan dana.');
            }

            $partnerWallet->pending_balance -= $amount;
            $partnerWallet->available_balance += $amount;
            $partnerWallet->save();

            WalletTransaction::create([
                'wallet_id' => $partnerWallet->id,
                'type' => WalletTransaction::TYPE_RELEASE,
                'amount' => $amount,
                'balance_after' => $partnerWallet->pending_balance + $partnerWallet->available_balance,
                'order_id' => $order->id,
                'withdrawal_id' => null,
                'reference' => 'WTX-'.strtoupper(bin2hex(random_bytes(10))),
            ]);
        });
    }

    public function refundOnOrderCancelled(Order $order, Payment $payment): void
    {
        DB::transaction(function () use ($order, $payment) {
            $alreadyRefunded = WalletTransaction::where('order_id', $order->id)
                ->where('type', WalletTransaction::TYPE_REFUND)
                ->exists();

            if (! $alreadyRefunded) {
                $holdTx = WalletTransaction::where('order_id', $order->id)
                    ->where('type', WalletTransaction::TYPE_HOLD)
                    ->first();

                if ($holdTx) {
                    $partnerWallet = Wallet::where('id', $holdTx->wallet_id)->lockForUpdate()->firstOrFail();
                    $partnerAmount = (int) $holdTx->amount;

                    if ($partnerWallet->pending_balance < $partnerAmount) {
                        throw new RuntimeException('Saldo tertahan mitra tidak mencukupi untuk refund.');
                    }

                    $partnerWallet->pending_balance -= $partnerAmount;
                    $partnerWallet->save();

                    WalletTransaction::create([
                        'wallet_id' => $partnerWallet->id,
                        'type' => WalletTransaction::TYPE_REFUND,
                        'amount' => $partnerAmount,
                        'balance_after' => $partnerWallet->pending_balance + $partnerWallet->available_balance,
                        'order_id' => $order->id,
                        'withdrawal_id' => null,
                        'reference' => 'WTX-'.strtoupper(bin2hex(random_bytes(10))),
                    ]);
                }

                $paymentInTx = WalletTransaction::where('order_id', $order->id)
                    ->where('type', WalletTransaction::TYPE_PAYMENT_IN)
                    ->first();

                if ($paymentInTx) {
                    $platformWallet = Wallet::where('id', $paymentInTx->wallet_id)->lockForUpdate()->firstOrFail();
                    $platformAmount = (int) $paymentInTx->amount;

                    if ($platformWallet->available_balance < $platformAmount) {
                        throw new RuntimeException('Saldo platform tidak mencukupi untuk refund.');
                    }

                    $platformWallet->available_balance -= $platformAmount;
                    $platformWallet->save();

                    WalletTransaction::create([
                        'wallet_id' => $platformWallet->id,
                        'type' => WalletTransaction::TYPE_REFUND,
                        'amount' => $platformAmount,
                        'balance_after' => $platformWallet->pending_balance + $platformWallet->available_balance,
                        'order_id' => $order->id,
                        'withdrawal_id' => null,
                        'reference' => 'WTX-'.strtoupper(bin2hex(random_bytes(10))),
                    ]);
                }
            }

            $lockedPayment = Payment::where('id', $payment->id)->lockForUpdate()->firstOrFail();
            $lockedPayment->status = Payment::STATUS_REFUNDED;
            $lockedPayment->save();
        });
    }

    public function withdraw(User $user, int $amount, ?string $idempotencyKey = null): array
    {
        $minAmount = (int) config('wallet.payout_min_amount', 10000);

        if ($amount < $minAmount) {
            throw ValidationException::withMessages([
                'amount' => ["Minimal penarikan adalah Rp {$minAmount}."],
            ]);
        }

        $normalizedKey = $idempotencyKey !== null ? trim($idempotencyKey) : '';
        if (strlen($normalizedKey) > 100) {
            throw ValidationException::withMessages([
                'idempotency_key' => ['Header Idempotency-Key maksimal 100 karakter.'],
            ]);
        }

        if ($normalizedKey !== '') {
            $existing = Withdrawal::where('user_id', $user->id)
                ->where('idempotency_key', $normalizedKey)
                ->first();

            if ($existing) {
                return ['withdrawal' => $existing, 'created' => false];
            }
        }

        $bankAccount = PartnerBankAccount::where('user_id', $user->id)->first();
        if (! $bankAccount) {
            throw ValidationException::withMessages([
                'bank_account' => ['Rekening bank belum diatur. Silakan lengkapi rekening bank terlebih dahulu.'],
            ]);
        }

        try {
            return DB::transaction(function () use ($user, $amount, $normalizedKey) {
                $wallet = $this->getOrCreatePartnerWallet($user->id);

                if ($wallet->available_balance < $amount) {
                    throw ValidationException::withMessages([
                        'amount' => ['Saldo tersedia tidak mencukupi untuk penarikan.'],
                    ]);
                }

                $wallet->available_balance -= $amount;
                $wallet->save();

                $withdrawal = Withdrawal::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'status' => Withdrawal::STATUS_SUCCESS,
                    'reference' => 'WD-'.strtoupper(bin2hex(random_bytes(8))),
                    'idempotency_key' => $normalizedKey !== '' ? $normalizedKey : null,
                ]);

                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => WalletTransaction::TYPE_WITHDRAWAL,
                    'amount' => $amount,
                    'balance_after' => $wallet->pending_balance + $wallet->available_balance,
                    'order_id' => null,
                    'withdrawal_id' => $withdrawal->id,
                    'reference' => 'WTX-'.strtoupper(bin2hex(random_bytes(10))),
                ]);

                return ['withdrawal' => $withdrawal, 'created' => true];
            });
        } catch (QueryException $e) {
            if ($e->getCode() === '23000' && $normalizedKey !== '') {
                $existing = Withdrawal::where('user_id', $user->id)
                    ->where('idempotency_key', $normalizedKey)
                    ->first();

                if ($existing) {
                    return ['withdrawal' => $existing, 'created' => false];
                }
            }

            throw $e;
        }
    }
}
