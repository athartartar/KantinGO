<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Voucher;

class VoucherPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function redeem(User $user): bool
    {
        return true;
    }

    public function claim(User $user, Voucher $voucher): bool
    {
        return true;
    }
}
