<?php

namespace App\Policies;

use App\Models\Menu;
use App\Models\User;
use App\Models\Warung;

class MenuPolicy
{
    public function viewAny(User $user): bool
    {
        $warung = Warung::where('owner_id', $user->id)->first();

        return $user->role === 'warung_owner' && $warung !== null && $warung->status === 'approved';
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function view(User $user, Menu $menu): bool
    {
        $warung = Warung::where('owner_id', $user->id)->first();

        return $user->role === 'warung_owner'
            && $warung !== null
            && $warung->status === 'approved'
            && $menu->warung_id === $warung->id;
    }

    public function update(User $user, Menu $menu): bool
    {
        return $this->view($user, $menu);
    }

    public function delete(User $user, Menu $menu): bool
    {
        return $this->view($user, $menu);
    }
}
