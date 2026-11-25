<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $seedPassword = env('SEED_PASSWORD');

        if (! is_string($seedPassword) || trim($seedPassword) === '') {
            throw new RuntimeException('SEED_PASSWORD belum diatur di environment.');
        }

        $hashedPassword = Hash::make($seedPassword);

        $users = [
            [
                'email' => 'admin@kantingo.id',
                'name' => 'Admin KantinGO',
                'phone' => '081100000001',
                'points' => 0,
                'avatar_path' => null,
                'role' => 'admin',
            ],
            [
                'email' => 'mitra@kantingo.id',
                'name' => 'Bu Siti',
                'phone' => '081200000001',
                'points' => 0,
                'avatar_path' => null,
                'role' => 'warung_owner',
            ],
            [
                'email' => 'owner.warung2@kantingo.id',
                'name' => 'Barista Kedai Kopi',
                'phone' => '081200000002',
                'points' => 0,
                'avatar_path' => null,
                'role' => 'warung_owner',
            ],
            [
                'email' => 'owner.warung3@kantingo.id',
                'name' => 'Mas Bro',
                'phone' => '081200000003',
                'points' => 0,
                'avatar_path' => null,
                'role' => 'warung_owner',
            ],
            [
                'email' => 'owner.warung4@kantingo.id',
                'name' => 'Pak Podomoro',
                'phone' => '081200000004',
                'points' => 0,
                'avatar_path' => null,
                'role' => 'warung_owner',
            ],
            [
                'email' => 'owner.warung5@kantingo.id',
                'name' => 'Uncle Sam',
                'phone' => '081200000005',
                'points' => 0,
                'avatar_path' => null,
                'role' => 'warung_owner',
            ],
            [
                'email' => 'owner.warung6@kantingo.id',
                'name' => 'Mbak Ceria',
                'phone' => '081200000006',
                'points' => 0,
                'avatar_path' => null,
                'role' => 'warung_owner',
            ],
            [
                'email' => 'mitra.pending@kantingo.id',
                'name' => 'Pak Budi Mitra Baru',
                'phone' => '081200000099',
                'points' => 0,
                'avatar_path' => null,
                'role' => 'warung_owner',
            ],
            [
                'email' => 'customer1@kantingo.id',
                'name' => 'Ahmad Zaki',
                'phone' => '081300000001',
                'points' => 150,
                'avatar_path' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                'role' => 'customer',
            ],
            [
                'email' => 'customer2@kantingo.id',
                'name' => 'Dinda Maharani',
                'phone' => '081300000002',
                'points' => 250,
                'avatar_path' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                'role' => 'customer',
            ],
        ];

        foreach ($users as $data) {
            $user = User::withTrashed()->firstOrNew(['email' => $data['email']]);
            if ($user->trashed()) {
                $user->restore();
            }
            $user->fill([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'password' => $hashedPassword,
                'points' => $data['points'],
                'avatar_path' => $data['avatar_path'],
            ]);
            $user->role = $data['role'];
            $user->email_verified_at = $user->email_verified_at ?? now();
            $user->save();
        }
    }
}
