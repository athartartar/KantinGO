<?php

namespace App\Policies;

use App\Models\Menu;
use App\Models\MenuAddon;
use App\Models\User;
use App\Models\Warung;

class MenuAddonPolicy
{
    public function viewAny(User $user, Menu $menu): bool
    {
        $warung = Warung::where('owner_id', $user->id)->first();

        return $user->role === 'warung_owner'
            && $warung !== null
            && $warung->status === 'approved'
            && $menu->warung_id === $warung->id;
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
