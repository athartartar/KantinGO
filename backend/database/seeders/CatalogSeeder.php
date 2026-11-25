<?php

namespace Database\Seeders;

use App\Models\Canteen;
use App\Models\Category;
use App\Models\Menu;
use App\Models\MenuAddon;
use App\Models\User;
use App\Models\Warung;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $canteens = [
            ['slug' => 'kantin-utama-gedung-a', 'name' => 'Kantin Utama Gedung A', 'location' => 'Kantin Utama Gedung A, Lantai 1', 'description' => 'Area kantin utama mahasiswa di Gedung A lantai 1.'],
            ['slug' => 'kantin-pusat', 'name' => 'Kantin Pusat', 'location' => 'Kantin Pusat, Sayap Barat', 'description' => 'Area kantin pusat dan kedai kopi sayap barat.'],
            ['slug' => 'food-court-perpustakaan', 'name' => 'Food Court Perpustakaan', 'location' => 'Food Court Perpustakaan', 'description' => 'Food court dekat perpustakaan pusat.'],
            ['slug' => 'kantin-gedung-bawah', 'name' => 'Kantin Gedung Bawah', 'location' => 'Kantin Gedung Bawah', 'description' => 'Area kantin gedung bawah.'],
            ['slug' => 'kantin-selasar-barat', 'name' => 'Kantin Selasar Barat', 'location' => 'Kantin Selasar Barat', 'description' => 'Area kantin selasar barat.'],
            ['slug' => 'kantin-gedung-c', 'name' => 'Kantin Gedung C', 'location' => 'Kantin Gedung C', 'description' => 'Area kantin gedung C.'],
        ];

        $canteenMap = [];
        foreach ($canteens as $c) {
            $canteenMap[$c['slug']] = Canteen::updateOrCreate(['slug' => $c['slug']], $c + ['is_active' => true]);
        }

        $categories = [
            ['slug' => 'makanan-berat', 'name' => 'Makanan Berat', 'icon' => 'utensils', 'sort_order' => 1],
            ['slug' => 'minuman', 'name' => 'Minuman', 'icon' => 'coffee', 'sort_order' => 2],
            ['slug' => 'camilan', 'name' => 'Camilan', 'icon' => 'cookie', 'sort_order' => 3],
            ['slug' => 'paket-hemat', 'name' => 'Paket Hemat', 'icon' => 'sparkles', 'sort_order' => 4],
        ];

        $categoryMap = [];
        foreach ($categories as $cat) {
            $categoryMap[$cat['name']] = Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        $admin = User::where('email', 'admin@kantingo.id')->first();

        $warungDefs = [
            [
                'key' => '1',
                'owner_email' => 'mitra@kantingo.id',
                'canteen_slug' => 'kantin-utama-gedung-a',
                'name' => 'Kantin Bu Siti - Masakan Nusantara',
                'slug' => 'kantin-bu-siti-masakan-nusantara',
                'description' => 'Kantin legendaris kampus menyajikan aneka olahan ayam, masakan rumahan khas nusantara, sayuran segar, dan sambal racikan istimewa dengan harga ramah kantong mahasiswa.',
                'location' => 'Kantin Utama Gedung A, Lantai 1',
                'opening_hours' => '08:00 - 17:00',
                'logo_path' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
                'estimated_minutes' => 10,
                'rating_avg' => 4.80,
                'review_count' => 5,
                'status' => 'approved',
                'is_open' => true,
            ],
            [
                'key' => '2',
                'owner_email' => 'owner.warung2@kantingo.id',
                'canteen_slug' => 'kantin-pusat',
                'name' => 'Kedai Kopi Kampus 2.0',
                'slug' => 'kedai-kopi-kampus-2-0',
                'description' => 'Tempat nongkrong andalan mahasiswa dengan pilihan kopi espresso, kopi susu gula aren barista, mocktail segar, pastry, dan camilan renyah untuk menemani waktu belajar.',
                'location' => 'Kantin Pusat, Sayap Barat',
                'opening_hours' => '07:30 - 19:00',
                'logo_path' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80',
                'estimated_minutes' => 5,
                'rating_avg' => 4.80,
                'review_count' => 5,
                'status' => 'approved',
                'is_open' => true,
            ],
            [
                'key' => '3',
                'owner_email' => 'owner.warung3@kantingo.id',
                'canteen_slug' => 'food-court-perpustakaan',
                'name' => 'Ayam Geprek Mas Bro',
                'slug' => 'ayam-geprek-mas-bro',
                'description' => 'Spesialis ayam geprek crispy beraneka sambal pedas berlevel, topping keju leleh melimpah, dan porsi nasi puas yang siap bikin harimu bertenaga.',
                'location' => 'Food Court Perpustakaan',
                'opening_hours' => '09:00 - 18:00',
                'logo_path' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
                'estimated_minutes' => 12,
                'rating_avg' => 4.60,
                'review_count' => 5,
                'status' => 'approved',
                'is_open' => true,
            ],
            [
                'key' => '4',
                'owner_email' => 'owner.warung4@kantingo.id',
                'canteen_slug' => 'kantin-gedung-bawah',
                'name' => 'Bakso & Mie Ayam Podomoro',
                'slug' => 'bakso-mie-ayam-podomoro',
                'description' => 'Bakso urat dan mie ayam pangsit kuah gurih favorit mahasiswa.',
                'location' => 'Kantin Gedung Bawah',
                'opening_hours' => '09:30 - 16:30',
                'logo_path' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
                'estimated_minutes' => 15,
                'rating_avg' => 4.60,
                'review_count' => 180,
                'status' => 'approved',
                'is_open' => false,
            ],
            [
                'key' => '5',
                'owner_email' => 'owner.warung5@kantingo.id',
                'canteen_slug' => 'kantin-selasar-barat',
                'name' => 'Burger & Fries Uncle Sam',
                'slug' => 'burger-fries-uncle-sam',
                'description' => 'Burger patty panggang juicy dan kentang goreng renyah ala western.',
                'location' => 'Kantin Selasar Barat',
                'opening_hours' => '10:00 - 18:00',
                'logo_path' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
                'estimated_minutes' => 8,
                'rating_avg' => 4.80,
                'review_count' => 210,
                'status' => 'approved',
                'is_open' => true,
            ],
            [
                'key' => '6',
                'owner_email' => 'owner.warung6@kantingo.id',
                'canteen_slug' => 'kantin-gedung-c',
                'name' => 'Kedai Minuman Segar Ceria',
                'slug' => 'kedai-minuman-segar-ceria',
                'description' => 'Aneka es teh, jus buah segar, dan minuman boba kekinian.',
                'location' => 'Kantin Gedung C',
                'opening_hours' => '08:00 - 17:30',
                'logo_path' => 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
                'estimated_minutes' => 5,
                'rating_avg' => 4.70,
                'review_count' => 165,
                'status' => 'approved',
                'is_open' => true,
            ],
            [
                'key' => '7',
                'owner_email' => 'mitra.pending@kantingo.id',
                'canteen_slug' => 'kantin-utama-gedung-a',
                'name' => 'Warung Nusantara Pak Budi',
                'slug' => 'warung-nusantara-pak-budi',
                'description' => 'Calon mitra baru menyajikan nasi rames, rendang, dan sayur lodeh.',
                'location' => 'Kantin Utama Gedung A, Lantai 2',
                'opening_hours' => '08:00 - 16:00',
                'logo_path' => null,
                'estimated_minutes' => 10,
                'rating_avg' => 0.00,
                'review_count' => 0,
                'status' => 'pending',
                'is_open' => false,
            ],
        ];

        $warungMap = [];
        foreach ($warungDefs as $w) {
            $owner = User::where('email', $w['owner_email'])->first();
            $canteen = $canteenMap[$w['canteen_slug']] ?? null;
            if (! $owner) {
                continue;
            }

            $isApproved = $w['status'] === 'approved';
            $warungMap[$w['key']] = Warung::updateOrCreate(
                ['slug' => $w['slug']],
                [
                    'owner_id' => $owner->id,
                    'canteen_id' => $canteen?->id,
                    'name' => $w['name'],
                    'description' => $w['description'],
                    'location' => $w['location'],
                    'opening_hours' => $w['opening_hours'],
                    'logo_path' => $w['logo_path'],
                    'estimated_minutes' => $w['estimated_minutes'],
                    'rating_avg' => $w['rating_avg'],
                    'review_count' => $w['review_count'],
                    'status' => $w['status'],
                    'rejection_reason' => null,
                    'is_open' => $w['is_open'],
                    'approved_at' => $isApproved ? now() : null,
                    'approved_by' => $isApproved ? $admin?->id : null,
                ]
            );
        }

        $menus = [
            [
                'warung' => '1',
                'category' => 'Makanan Berat',
                'name' => 'Ayam Geprek Sambal Matah',
                'description' => 'Ayam krispi gurih dengan ulekan sambal matah khas Bali segar dan nasi hangat pulen.',
                'price' => 18000,
                'image_path' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.9,
                'sold_count' => 1420,
                'addons' => [
                    ['key' => 'addon-level-matah', 'title' => 'Level Pedas Sambal Matah', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Level 0 (Tidak Pedas)', 'price' => 0],
                        ['name' => 'Level 1 (Sedang)', 'price' => 0],
                        ['name' => 'Level 2 (Pedas)', 'price' => 0],
                        ['name' => 'Level 3 (Ekstra Pedas)', 'price' => 2000],
                    ]],
                    ['key' => 'addon-nasi-matah', 'title' => 'Pilihan Nasi', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Nasi Putih Pulen', 'price' => 0],
                        ['name' => 'Nasi Uduk Gurih', 'price' => 3000],
                        ['name' => 'Tanpa Nasi', 'price' => 0],
                    ]],
                    ['key' => 'addon-extra-matah', 'title' => 'Topping Tambahan', 'type' => 'multiple', 'required' => false, 'options' => [
                        ['name' => 'Telur Dadar Crispy', 'price' => 4000],
                        ['name' => 'Ekstra Keju Mozarella Leleh', 'price' => 5000],
                        ['name' => 'Porsi Tambahan Sambal Matah', 'price' => 3000],
                        ['name' => 'Kerupuk Udang', 'price' => 2000],
                    ]],
                ],
            ],
            [
                'warung' => '1',
                'category' => 'Makanan Berat',
                'name' => 'Nasi Goreng Spesial Kampus',
                'description' => 'Nasi goreng bumbu racik istimewa dengan telur mata sapi, suwiran ayam, acar dan kerupuk renyah.',
                'price' => 15000,
                'image_path' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.8,
                'sold_count' => 980,
                'addons' => [
                    ['key' => 'addon-telur-nasgor', 'title' => 'Tingkat Kematangan Telur', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Telur Ceplok Matang', 'price' => 0],
                        ['name' => 'Telur Ceplok Setengah Matang', 'price' => 0],
                        ['name' => 'Telur Dadar Rempah', 'price' => 0],
                    ]],
                    ['key' => 'addon-pedas-nasgor', 'title' => 'Level Pedas', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Sedang', 'price' => 0],
                        ['name' => 'Pedas Mantap', 'price' => 0],
                        ['name' => 'Super Pedas', 'price' => 1500],
                    ]],
                    ['key' => 'addon-extra-nasgor', 'title' => 'Topping Tambahan', 'type' => 'multiple', 'required' => false, 'options' => [
                        ['name' => 'Sosis Sapi Goreng', 'price' => 3000],
                        ['name' => 'Bakso Sapi Iris', 'price' => 3000],
                        ['name' => 'Ati Ampela', 'price' => 4000],
                    ]],
                ],
            ],
            [
                'warung' => '1',
                'category' => 'Makanan Berat',
                'name' => 'Soto Ayam Lamongan',
                'description' => 'Kuah kuning gurih kaya rempah dengan taburan koya gurih, suwiran ayam, soun lembut, dan kol segar.',
                'price' => 16000,
                'image_path' => 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.7,
                'sold_count' => 650,
                'addons' => [
                    ['key' => 'addon-soto-nasi', 'title' => 'Penyajian Nasi', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Nasi Dicampur ke Kuah', 'price' => 0],
                        ['name' => 'Nasi Dipisah', 'price' => 1000],
                    ]],
                    ['key' => 'addon-soto-topping', 'title' => 'Topping Tambahan', 'type' => 'multiple', 'required' => false, 'options' => [
                        ['name' => 'Ekstra Bubuk Koya Gurih', 'price' => 2000],
                        ['name' => 'Telur Rebus 1 Butir', 'price' => 3500],
                        ['name' => 'Perkedel Kentang', 'price' => 2500],
                    ]],
                ],
            ],
            [
                'warung' => '1',
                'category' => 'Minuman',
                'name' => 'Es Teh Manis Jumbo',
                'description' => 'Teh seduh wangi melati asli dengan es batu segar melimpah dalam gelas ukuran jumbo 500ml.',
                'price' => 4000,
                'image_path' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.9,
                'sold_count' => 2890,
                'addons' => [
                    ['key' => 'addon-manis-esteh', 'title' => 'Tingkat Manis', 'type' => 'single', 'required' => false, 'options' => [
                        ['name' => 'Manis Normal', 'price' => 0],
                        ['name' => 'Sedang / Less Sugar', 'price' => 0],
                        ['name' => 'Tawar (Tanpa Gula)', 'price' => 0],
                    ]],
                ],
            ],
            [
                'warung' => '1',
                'category' => 'Camilan',
                'name' => 'Tempe Mendoan (3 pcs)',
                'description' => 'Tempe kedelai berbalut adonan tepung gurih daun bawang disajikan hangat dengan cocolan kecap pedas.',
                'price' => 7000,
                'image_path' => 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.8,
                'sold_count' => 820,
                'addons' => [
                    ['key' => 'addon-cocolan-mendoan', 'title' => 'Pilihan Sambal Cocol', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Sambal Kecap Rawit', 'price' => 0],
                        ['name' => 'Sambal Bawang Pedas', 'price' => 1000],
                    ]],
                ],
            ],
            [
                'warung' => '2',
                'category' => 'Minuman',
                'name' => 'Kopi Susu Gula Aren Barista',
                'description' => 'Espresso robusta lokal dipadu susu creamy dan manis legit gula aren murni racikan barista.',
                'price' => 12000,
                'image_path' => 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.9,
                'sold_count' => 2310,
                'addons' => [
                    ['key' => 'addon-sugar-kopi', 'title' => 'Tingkat Kemanisan', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Normal Sweet', 'price' => 0],
                        ['name' => 'Less Sugar (50%)', 'price' => 0],
                        ['name' => 'No Sugar (0%)', 'price' => 0],
                    ]],
                    ['key' => 'addon-ice-kopi', 'title' => 'Pilihan Es', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Normal Ice', 'price' => 0],
                        ['name' => 'Less Ice', 'price' => 0],
                        ['name' => 'Penyajian Panas (Hot)', 'price' => 0],
                    ]],
                    ['key' => 'addon-topping-kopi', 'title' => 'Topping', 'type' => 'multiple', 'required' => false, 'options' => [
                        ['name' => 'Ekstra 1 Shot Espresso', 'price' => 4000],
                        ['name' => 'Coffee Jelly', 'price' => 3000],
                        ['name' => 'Grass Jelly (Cincau)', 'price' => 2500],
                    ]],
                ],
            ],
            [
                'warung' => '2',
                'category' => 'Minuman',
                'name' => 'Matcha Latte Creamy Ice',
                'description' => 'Bubuk teh hijau matcha Jepang asli dengan susu segar lembut dan manis pas yang menenangkan.',
                'price' => 14000,
                'image_path' => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.8,
                'sold_count' => 740,
                'addons' => [
                    ['key' => 'addon-matcha-sugar', 'title' => 'Tingkat Kemanisan', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Normal Sweet', 'price' => 0],
                        ['name' => 'Less Sugar', 'price' => 0],
                    ]],
                    ['key' => 'addon-matcha-topping', 'title' => 'Topping Tambahan', 'type' => 'multiple', 'required' => false, 'options' => [
                        ['name' => 'Egg Pudding', 'price' => 3000],
                        ['name' => 'Cream Cheese Foam', 'price' => 4000],
                    ]],
                ],
            ],
            [
                'warung' => '2',
                'category' => 'Minuman',
                'name' => 'Americano Double Shot',
                'description' => 'Double shot espresso dengan air dingin segar, aroma wangi kopi bold tanpa tambahan gula.',
                'price' => 10000,
                'image_path' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.7,
                'sold_count' => 910,
                'addons' => [
                    ['key' => 'addon-ame-style', 'title' => 'Suhu Penyajian', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Iced Americano', 'price' => 0],
                        ['name' => 'Hot Americano', 'price' => 0],
                    ]],
                ],
            ],
            [
                'warung' => '2',
                'category' => 'Camilan',
                'name' => 'Roti Bakar Cokelat Keju',
                'description' => 'Roti tawar tebal panggang mentega dengan isian cokelat lumer dan taburan keju cheddar parut melimpah.',
                'price' => 13000,
                'image_path' => 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.8,
                'sold_count' => 520,
                'addons' => [
                    ['key' => 'addon-roti-topping', 'title' => 'Ekstra Topping Roti', 'type' => 'multiple', 'required' => false, 'options' => [
                        ['name' => 'Ekstra Taburan Keju', 'price' => 3000],
                        ['name' => 'Susu Kental Manis', 'price' => 1500],
                    ]],
                ],
            ],
            [
                'warung' => '2',
                'category' => 'Camilan',
                'name' => 'Croissant Butter',
                'description' => 'Pastry renyah berlapis dengan aroma butter wangi khas Prancis, sangat cocok dinikmati bersama kopi.',
                'price' => 15000,
                'image_path' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.6,
                'sold_count' => 340,
                'addons' => [],
            ],
            [
                'warung' => '3',
                'category' => 'Makanan Berat',
                'name' => 'Paket Ayam Geprek Keju Leleh',
                'description' => 'Ayam geprek pedas berlumur lelehan keju mozarella gurih nikmat dan disajikan dengan nasi hangat.',
                'price' => 22000,
                'image_path' => 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.7,
                'sold_count' => 860,
                'addons' => [
                    ['key' => 'addon-level-bro', 'title' => 'Pilihan Level Cabai', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Level 1 (1 Cabai)', 'price' => 0],
                        ['name' => 'Level 3 (3 Cabai - Sedang)', 'price' => 0],
                        ['name' => 'Level 5 (5 Cabai - Pedas)', 'price' => 0],
                        ['name' => 'Level 10 (10 Cabai Super Pedas)', 'price' => 3000],
                    ]],
                    ['key' => 'addon-side-bro', 'title' => 'Menu Pelengkap', 'type' => 'multiple', 'required' => false, 'options' => [
                        ['name' => 'Ekstra Kulit Krispi', 'price' => 5000],
                        ['name' => 'Tahu & Tempe Goreng', 'price' => 3000],
                        ['name' => 'Kol Goreng Gurih', 'price' => 3000],
                    ]],
                ],
            ],
            [
                'warung' => '3',
                'category' => 'Makanan Berat',
                'name' => 'Ayam Geprek Sambal Bawang',
                'description' => 'Ayam goreng tepung renyah digeprek dengan ulekan sambal bawang segar bercita rasa gurih pedas nampol.',
                'price' => 16000,
                'image_path' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.8,
                'sold_count' => 1120,
                'addons' => [
                    ['key' => 'addon-bawang-lvl', 'title' => 'Level Pedas', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Level 1 (Sedang)', 'price' => 0],
                        ['name' => 'Level 2 (Pedas)', 'price' => 0],
                        ['name' => 'Level 3 (Ekstra Pedas)', 'price' => 2000],
                    ]],
                    ['key' => 'addon-bawang-nasi', 'title' => 'Pilihan Nasi', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Nasi Putih', 'price' => 0],
                        ['name' => 'Tanpa Nasi', 'price' => 0],
                    ]],
                ],
            ],
            [
                'warung' => '3',
                'category' => 'Paket Hemat',
                'name' => 'Paket Geprek Hemat Komplit',
                'description' => 'Ayam geprek krispi, nasi pulen, tahu, tempe, lalapan mentimun segar, serta es teh manis segar.',
                'price' => 18000,
                'image_path' => 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.8,
                'sold_count' => 940,
                'addons' => [
                    ['key' => 'addon-hemat-lvl', 'title' => 'Level Pedas', 'type' => 'single', 'required' => true, 'options' => [
                        ['name' => 'Sedang', 'price' => 0],
                        ['name' => 'Pedas', 'price' => 0],
                    ]],
                ],
            ],
            [
                'warung' => '3',
                'category' => 'Camilan',
                'name' => 'Kulit Krispi Pedas Gurih',
                'description' => 'Kulit ayam renyah digoreng garing keemasan dengan taburan bumbu pedas gurih dan aroma daun jeruk.',
                'price' => 8000,
                'image_path' => 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.9,
                'sold_count' => 1670,
                'addons' => [],
            ],
            [
                'warung' => '3',
                'category' => 'Minuman',
                'name' => 'Es Jeruk Segar',
                'description' => 'Perasan jeruk manis segar asli dipadukan dengan gula tebu dan es batu dingin pelepas dahaga.',
                'price' => 5000,
                'image_path' => 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80',
                'rating_avg' => 4.8,
                'sold_count' => 1450,
                'addons' => [],
            ],
        ];

        foreach ($menus as $m) {
            $warung = $warungMap[$m['warung']] ?? null;
            $category = $categoryMap[$m['category']] ?? null;
            if (! $warung) {
                continue;
            }

            $menu = Menu::updateOrCreate(
                [
                    'warung_id' => $warung->id,
                    'name' => $m['name'],
                ],
                [
                    'category_id' => $category?->id,
                    'description' => $m['description'],
                    'price' => $m['price'],
                    'image_path' => $m['image_path'],
                    'is_available' => true,
                    'rating_avg' => $m['rating_avg'],
                    'sold_count' => $m['sold_count'],
                ]
            );

            $sortOrder = 0;
            foreach ($m['addons'] as $group) {
                foreach ($group['options'] as $opt) {
                    $sortOrder++;
                    MenuAddon::updateOrCreate(
                        [
                            'menu_id' => $menu->id,
                            'group_key' => $group['key'],
                            'option_name' => $opt['name'],
                        ],
                        [
                            'group_title' => $group['title'],
                            'selection_type' => $group['type'],
                            'is_required' => $group['required'],
                            'additional_price' => $opt['price'],
                            'is_available' => true,
                            'sort_order' => $sortOrder,
                        ]
                    );
                }
            }
        }
    }
}
