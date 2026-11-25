<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\User;
use App\Models\Warung;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $seedPassword = env('SEED_PASSWORD');
        $hashedPassword = Hash::make($seedPassword);

        $warungSlugs = [
            '1' => 'kantin-bu-siti-masakan-nusantara',
            '2' => 'kedai-kopi-kampus-2-0',
            '3' => 'ayam-geprek-mas-bro',
        ];

        $warungs = Warung::whereIn('slug', array_values($warungSlugs))->get()->keyBy('slug');

        $reviews = [
            ['warung' => '1', 'name' => 'Ahmad Zaki', 'email' => 'customer1@kantingo.id', 'rating' => 5, 'comment' => 'Ayam geprek sambal matahnya the best di kampus! Porsi nasinya banyak dan sambalnya fresh banget.', 'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-02 12:15:00'],
            ['warung' => '1', 'name' => 'Dinda Maharani', 'email' => 'customer2@kantingo.id', 'rating' => 5, 'comment' => 'Nasi goreng spesialnya enak banget, telurnya pas setengah matang. Pelayanan Bu Siti ramah selalu.', 'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-04 12:30:00'],
            ['warung' => '1', 'name' => 'Bima Pratama', 'email' => null, 'rating' => 4, 'comment' => 'Soto ayam lamongannya gurih kuahnya kaya koya rempah. Enak disantap pas makan siang pas hujan.', 'avatar' => 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-06 12:45:00'],
            ['warung' => '1', 'name' => 'Siti Rahma', 'email' => null, 'rating' => 5, 'comment' => 'Tempe mendoannya anget-anget waktu di-pickup, sambal kecap rawitnya nampol. Recommended!', 'avatar' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-07 13:00:00'],
            ['warung' => '1', 'name' => 'Fikri Ramadhan', 'email' => null, 'rating' => 5, 'comment' => 'Sangat praktis pesan lewat KantinGO, gak perlu antre berjubel lagi jam makan siang.', 'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-08 13:15:00'],

            ['warung' => '2', 'name' => 'Sarah Jessica', 'email' => null, 'rating' => 5, 'comment' => 'Kopi susu arennya juara! Creamy tapi rasa espresso robustanya tetap mantap kerasa di lidah.', 'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-03 10:00:00'],
            ['warung' => '2', 'name' => 'Rian Saputra', 'email' => null, 'rating' => 5, 'comment' => 'Matcha Latte-nya beneran otentik gak cuma manis gula. Enak banget buat nemenin nugas di perpus.', 'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-05 14:00:00'],
            ['warung' => '2', 'name' => 'Clara Anindya', 'email' => null, 'rating' => 4, 'comment' => 'Croissant butternya renyah flakey, cocok dicocol ke kopi susu panas. Baristanya cekatan.', 'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-06 09:30:00'],
            ['warung' => '2', 'name' => 'Dimas Anggara', 'email' => null, 'rating' => 5, 'comment' => 'Americano double shot bikin melek seharian pas ujian tengah semester. Harga mahasiswa!', 'avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-07 08:45:00'],
            ['warung' => '2', 'name' => 'Nadia Putri', 'email' => null, 'rating' => 5, 'comment' => 'Roti bakar cokelat kejunya melimpah! Waktu pick-up langsung siap di counter sayap barat.', 'avatar' => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-09 15:15:00'],

            ['warung' => '3', 'name' => 'Bayu Wicaksono', 'email' => null, 'rating' => 5, 'comment' => 'Level 5 keju lelehnya nendang banget! Keju mozarellanya tebal dan beneran melted.', 'avatar' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-01 12:00:00'],
            ['warung' => '3', 'name' => 'Vania Aurelia', 'email' => null, 'rating' => 4, 'comment' => 'Paket hemat komplit udah dapet es jeruk, tahu tempe kenyang pol cuma 18 ribu.', 'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-04 12:30:00'],
            ['warung' => '3', 'name' => 'Galih Perkasa', 'email' => null, 'rating' => 5, 'comment' => 'Kulit krispi pedas gurihnya nagih banget buat cemilan tambahan sambil nunggu kelas.', 'avatar' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-05 16:00:00'],
            ['warung' => '3', 'name' => 'Tasya Kamila', 'email' => null, 'rating' => 5, 'comment' => 'Sambal bawangnya gurih berminyak sedap, cabe rawitnya segar bukan cabe bubukan.', 'avatar' => 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-08 13:30:00'],
            ['warung' => '3', 'name' => 'Reza Mahendra', 'email' => null, 'rating' => 4, 'comment' => 'Ayamnya kriuk garing di luar juicy di dalam. Mas Bro pelayanannya cepat dan rapi.', 'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80', 'date' => '2026-11-09 12:45:00'],
        ];

        foreach ($reviews as $index => $item) {
            $warung = $warungs->get($warungSlugs[$item['warung']]);
            if (! $warung) {
                continue;
            }

            $email = $item['email'] ?? Str::slug($item['name'], '.').'@reviewer.kantingo.id';
            $user = User::withTrashed()->firstOrNew(['email' => $email]);
            if ($user->trashed()) {
                $user->restore();
            }
            if (! $user->exists) {
                $user->fill([
                    'name' => $item['name'],
                    'password' => $hashedPassword,
                    'avatar_path' => $item['avatar'],
                    'points' => 0,
                ]);
                $user->role = 'customer';
                $user->email_verified_at = now();
                $user->save();
            }

            $menu = $warung->menus()->first();
            $orderCode = 'KGO-SEED-REV-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT);
            $price = $menu ? $menu->price : 15000;

            $order = Order::withTrashed()->updateOrCreate(
                ['order_code' => $orderCode],
                [
                    'user_id' => $user->id,
                    'warung_id' => $warung->id,
                    'pickup_time' => '12:00 - 12:15',
                    'subtotal' => $price,
                    'discount' => 0,
                    'service_fee' => 1000,
                    'total' => $price + 1000,
                    'status' => 'selesai',
                    'completed_at' => $item['date'],
                    'deleted_at' => null,
                ]
            );

            if ($menu) {
                OrderItem::updateOrCreate(
                    [
                        'order_id' => $order->id,
                        'menu_id' => $menu->id,
                    ],
                    [
                        'menu_name' => $menu->name,
                        'menu_image' => $menu->image_path,
                        'quantity' => 1,
                        'unit_price' => $price,
                        'addons_snapshot' => [],
                        'subtotal' => $price,
                    ]
                );
            }

            Review::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'user_id' => $user->id,
                    'warung_id' => $warung->id,
                    'rating' => $item['rating'],
                    'comment' => $item['comment'],
                    'created_at' => $item['date'],
                    'updated_at' => $item['date'],
                ]
            );
        }
    }
}
