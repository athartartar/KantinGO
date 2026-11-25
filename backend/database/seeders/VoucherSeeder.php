<?php

namespace Database\Seeders;

use App\Models\Voucher;
use App\Models\User;
use App\Models\UserVoucher;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        $vouchers = [
            [
                'code' => 'KANTIN10',
                'title' => 'Potongan Spesial Rp 10.000',
                'type' => 'nominal',
                'value' => 10000,
                'min_spend' => 30000,
                'max_discount' => null,
                'quota' => 500,
                'valid_from' => '2026-01-01 00:00:00',
                'valid_until' => '2026-12-31 23:59:59',
                'is_active' => true,
            ],
            [
                'code' => 'HEMAT5',
                'title' => 'Diskon KantinGO Rp 5.000',
                'type' => 'nominal',
                'value' => 5000,
                'min_spend' => 15000,
                'max_discount' => null,
                'quota' => 500,
                'valid_from' => '2026-01-01 00:00:00',
                'valid_until' => '2026-12-31 23:59:59',
                'is_active' => true,
            ],
            [
                'code' => 'MABASTART',
                'title' => 'Diskon Mahasiswa Baru 20%',
                'type' => 'persen',
                'value' => 20,
                'min_spend' => 20000,
                'max_discount' => 5000,
                'quota' => 300,
                'valid_from' => '2026-01-01 00:00:00',
                'valid_until' => '2026-11-30 23:59:59',
                'is_active' => true,
            ],
            [
                'code' => 'LUNCHDEAL',
                'title' => 'Potongan Makan Siang Rp 4.000',
                'type' => 'nominal',
                'value' => 4000,
                'min_spend' => 15000,
                'max_discount' => null,
                'quota' => 300,
                'valid_from' => '2026-01-01 00:00:00',
                'valid_until' => '2026-11-25 23:59:59',
                'is_active' => true,
            ],
        ];

        $createdVouchers = [];
        foreach ($vouchers as $data) {
            $createdVouchers[$data['code']] = Voucher::updateOrCreate(
                ['code' => $data['code']],
                $data
            );
        }

        $customer = User::where('email', 'customer1@kantingo.id')->first();
        if ($customer) {
            foreach (['KANTIN10', 'HEMAT5'] as $code) {
                if (isset($createdVouchers[$code])) {
                    UserVoucher::updateOrCreate(
                        [
                            'user_id' => $customer->id,
                            'voucher_id' => $createdVouchers[$code]->id,
                        ],
                        [
                            'status' => 'active',
                            'claimed_at' => now(),
                        ]
                    );
                }
            }
        }
    }
}
