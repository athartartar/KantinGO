# Security Controls — KantinGO Backend

## Kontrol Keamanan yang Diterapkan

1. **Autentikasi & Otorisasi**
   - Laravel Sanctum dengan token ber-expiry (12 jam), role-based abilities, dan password hashing Argon2id.
   - Proteksi login: dummy hash untuk mencegah user enumeration via timing attack + lockout berbasis IP dan email (`throttle:auth`).
   - Otorisasi berbasis Policy (`OrderPolicy`, `WarungPolicy`, `MenuPolicy`, `MenuAddonPolicy`, `NotificationPolicy`, `ReviewPolicy`, `VoucherPolicy`) serta middleware `role:admin` dan `approved.partner` untuk mencegah IDOR dan eskalasi privilege.
   - Registrasi hanya mengizinkan role `customer` atau `partner` (dipetakan ke `warung_owner` berstatus `pending`); kolom `role` dan `points` tidak berada di `$fillable`.

2. **Integritas Transaksi, Harga, & Dompet**
   - Seluruh perhitungan harga, addon, diskon voucher, dan biaya layanan dihitung ulang di sisi server dari database di dalam `DB::transaction`.
   - `Idempotency-Key` dengan unique constraint pada `orders` dan `withdrawals` mencegah duplikasi transaksi akibat retry/race condition.
   - Operasi pembayaran (`lockForUpdate`), klaim/redeem voucher (`lockForUpdate`), pelepasan dana, refund, dan penarikan dana berjalan atomik lewat `WalletService`.
   - Tabel `wallets` memiliki `CHECK (pending_balance >= 0)` dan `CHECK (available_balance >= 0)`; `wallet_transactions` bersifat append-only (diblokir update/delete di model) dan dapat diaudit via `php artisan wallet:reconcile`.

3. **Perlindungan Data & Input**
   - Seluruh input divalidasi melalui `FormRequest`.
   - Nomor rekening mitra (`partner_bank_accounts.account_number`) dienkripsi di database (`encrypted` cast) dan hanya dikembalikan dalam format ter-mask.
   - Komentar ulasan di-strip tag HTML (`strip_tags`).
   - Upload gambar menu & avatar divalidasi MIME asli via `finfo`, dibatasi ukuran maksimal 2MB, diberi nama acak, dan di-re-encode menggunakan GD.
   - Query menggunakan Eloquent/Query Builder terparameterisasi; header keamanan HTTP ditambahkan lewat middleware `SecurityHeaders`.

4. **Rate Limiting & Audit Trail**
   - Endpoint publik simulator pembayaran dibatasi ketat (`payment-simulate-read` 20/menit, `payment-simulate-pay` 10/menit) dan dikontrol flag `PAYMENT_SIMULATOR_ENABLED` (khusus demo).
   - `audit_logs` mencatat aktivitas sensitif (login, gagal login, ganti sandi, order, pembayaran, perubahan status, pencairan, ubah rekening, redeem/claim voucher, approve/reject mitra) beserta IP dan user agent tanpa menyimpan password, token, kode pembayaran, atau nomor rekening mentah.

## Sisa Risiko & Rekomendasi Produksi

- **Simulator Pembayaran (`PAYMENT_SIMULATOR_ENABLED`)**: Flag ini khusus untuk lingkungan demo/pengembangan. Wajib diset `false` pada lingkungan produksi dan diganti dengan implementasi `PaymentGateway` penyedia pembayaran nyata (misalnya verifikasi signature webhook).
- **Rate Limiter & Cache Store**: Pada deployment multi-instance, gunakan `CACHE_STORE=redis` agar rate limiter dan lock terdistribusi konsisten antar node.
- **Database User**: Gunakan user database berhak akses minimal (contoh pada [grant_app_user.sql](database/sql/grant_app_user.sql)), bukan `root`, serta aktifkan TLS untuk koneksi database jarak jauh dan HTTPS penuh (`SESSION_SECURE_COOKIE=true`).
