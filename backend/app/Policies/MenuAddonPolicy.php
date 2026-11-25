<?php

namespace App\Policies;

use App\Models\Menu;
use App\Models\MenuAddon;
use App\Models\User;

class MenuAddonPolicy
{
    public function viewAny(User $user, Menu $menu): bool
    {
        return $user->role === 'warung_owner'
            && $user->warung !== null
            && $user->warung->status === 'approved'
            && $menu->warung_id === $user->warung->id;
    }

    public function create(User $user, Menu $menu): bool
    {
        return $this->viewAny($user, $menu);
    }

    public function update(User $user, MenuAddon $addon, Menu $menu): bool
    {
        return $this->viewAny($user, $menu) && $addon->menu_id === $menu->id;
    }

    public function delete(User $user, MenuAddon $addon, Menu $menu): bool
    {
        return $this->viewAny($user, $menu) && $addon->menu_id === $menu->id;
    }
}
