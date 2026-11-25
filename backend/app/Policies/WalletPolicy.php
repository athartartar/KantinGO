<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Warung;

class WalletPolicy
{
    public function view(User $user, Wallet $wallet): bool
    {
        return $this->managePartner($user)
            && $wallet->type === Wallet::TYPE_PARTNER
            && $wallet->user_id === $user->id;
    }

    public function managePartner(User $user): bool
    {
        $warung = Warung::where('owner_id', $user->id)->first();

        return $user->role === 'warung_owner'
            && $warung !== null
            && $warung->status === 'approved';
    }
}
