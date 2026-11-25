<?php

namespace App\Listeners;

use App\Events\PaymentPaid;
use App\Services\Wallet\WalletService;

class CreditWalletsOnPaymentPaid
{
    public function __construct(private readonly WalletService $walletService)
    {
    }

    public function handle(PaymentPaid $event): void
    {
        $this->walletService->creditOnPaymentPaid($event->payment);
    }
}
