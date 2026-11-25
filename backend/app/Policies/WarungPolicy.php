<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Warung;

class WarungPolicy
{
    public function view(User $user, Warung $warung): bool
    {
        return $user->role === 'warung_owner'
            && $warung->owner_id === $user->id
            && $warung->status === 'approved';
    }

    public function update(User $user, Warung $warung): bool
    {
        return $this->view($user, $warung);
    }
}
