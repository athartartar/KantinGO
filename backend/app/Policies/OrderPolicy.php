<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        if ($order->user_id === $user->id || $user->role === 'admin') {
            return true;
        }

        if ($user->role === 'warung_owner') {
            $warung = $order->warung;

            return $warung !== null
                && $warung->owner_id === $user->id
                && $warung->status === 'approved';
        }

        return false;
    }

    public function cancel(User $user, Order $order): bool
    {
        return $order->user_id === $user->id || $user->role === 'admin';
    }

    public function updateStatus(User $user, Order $order): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'warung_owner') {
            $warung = $order->warung;

            return $warung !== null
                && $warung->owner_id === $user->id
                && $warung->status === 'approved';
        }

        return false;
    }

    public function confirmPickup(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }

    public function pay(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }
}
