<?php

namespace App\Policies;

use App\Models\Menu;
use App\Models\User;

class MenuPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'warung_owner' && $user->warung?->status === 'approved';
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function view(User $user, Menu $menu): bool
    {
        return $user->role === 'warung_owner'
            && $user->warung !== null
            && $user->warung->status === 'approved'
            && $menu->warung_id === $user->warung->id;
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
