# KantinGO

**KantinGO** adalah aplikasi web pick-up makanan dari kantin mitra — pelanggan memesan, memilih waktu pengambilan, dan membayar lewat QRIS, lalu tinggal ambil di warung tanpa antre.

> Monorepo **pnpm**: `frontend/` (React 19 + TypeScript + Vite 6 + TailwindCSS 4) dan `backend/` (Laravel 11 + MariaDB + Sanctum).

---

## Prasyarat

Pastikan semua alat berikut sudah terpasang sebelum memulai:

| Alat | Versi minimum | Cara cek |
|------|--------------|----------|
| **Git** | — | `git --version` |
| **Node.js** | 22 | `node -v` |
| **pnpm** | 12 | `pnpm -v` |
| **PHP** | 8.3 | `php -v` |
| **Composer** | 2 | `composer --version` |
| **MariaDB** | 10.6 | `mariadb --version` |

### Ekstensi PHP yang wajib aktif
`pdo_mysql`, `mbstring`, `openssl`, `xml`, `curl`, `zip`, `ctype`, `fileinfo`, `tokenizer`

Cek dengan: `php -m | grep -E "pdo_mysql|mbstring|openssl|xml|curl|zip|ctype|fileinfo|tokenizer"`

### Mengaktifkan pnpm via Corepack (jika belum ada)
```bash
corepack enable
corepack prepare pnpm@12.18.0 --activate
```

---

## Instalasi & Setup Pertama Kali

### 1. Clone repositori
```bash
git clone https://github.com/athartartar/KantinGO.git
cd KantinGO
```

### 2. Install dependensi frontend & root
```bash
pnpm install
```

### 3. Install dependensi backend
```bash
cd backend
composer install
```

### 4. Buat database
Jalankan MariaDB, lalu buat database baru:

```bash
# Lewat terminal (login sebagai root atau user yang punya akses)
mariadb -u root -p -e "CREATE DATABASE IF NOT EXISTS kantingo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Atau lewat phpMyAdmin / Laragon GUI: buat database bernama **`kantingo`** dengan collation **`utf8mb4_unicode_ci`**.

> **Opsional tapi direkomendasikan**: buat user khusus agar tidak pakai root.
> ```sql
> CREATE USER 'kantingo_app'@'localhost' IDENTIFIED BY 'password_kamu';
> GRANT ALL PRIVILEGES ON kantingo.* TO 'kantingo_app'@'localhost';
> FLUSH PRIVILEGES;
> ```

### 5. Konfigurasi environment backend

Masuk ke folder `backend/` (jika belum):
```bash
# Dari root KantinGO, sudah di dalam backend/ setelah langkah 3
cp .env.example .env
php artisan key:generate
```

Buka `backend/.env` dan sesuaikan bagian ini:

```env
APP_ENV=local
APP_DEBUG=true

DB_CONNECTION=mariadb
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kantingo
DB_USERNAME=root          # atau kantingo_app jika pakai user khusus
DB_PASSWORD=              # isi password MariaDB kamu

FRONTEND_URL=http://localhost:5173

# Password untuk semua akun demo (seed data) — bebas diisi apa saja
SEED_PASSWORD=password123
```

> **Jangan pernah commit file `.env` ke Git** — sudah di-ignore otomatis oleh `.gitignore`.

### 6. Migrasi dan seed database

```bash
# Masih di dalam backend/
php artisan migrate
php artisan db:seed
```

Perintah `db:seed` akan membuat tabel-tabel dan mengisi data demo:
- **5 warung** di 2 kantin
- **30+ menu** lengkap dengan addon
- **Voucher** diskon dan poin
- **Review** produk
- **Akun pengguna** siap login (lihat tabel di bawah)

Kembali ke root proyek:
```bash
cd ..
```

### 7. Konfigurasi environment frontend

```bash
# Dari root KantinGO
cp frontend/.env.example frontend/.env
```

Isi `frontend/.env` sudah benar secara default:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_USE_MOCK=false
```

Tidak perlu diubah untuk development lokal.

---

## Menjalankan Aplikasi

```bash
# Dari root KantinGO — jalankan frontend & backend sekaligus
pnpm dev
```

| Layanan | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000/api/v1 |
| **Health check** | http://localhost:8000/api/v1/health |

Untuk menjalankan terpisah:
```bash
pnpm dev:frontend   # hanya React (port 5173)
pnpm dev:backend    # hanya Laravel (port 8000)
```

---

## Akun Demo (Seed)

Semua akun menggunakan password yang kamu isi di `SEED_PASSWORD` (contoh: `password123`).

| Email | Nama | Role |
|-------|------|------|
| `customer1@kantingo.id` | Ahmad Zaki | 👤 Customer |
| `customer2@kantingo.id` | Dinda Maharani | 👤 Customer |
| `mitra@kantingo.id` | Bu Siti | 🏪 Pemilik Warung |
| `owner.warung2@kantingo.id` | Barista Kedai Kopi | 🏪 Pemilik Warung |
| `admin@kantingo.id` | Admin KantinGO | ⚙️ Admin |

> **Tips**: login dengan `customer1@kantingo.id` untuk mencoba alur pelanggan lengkap (pesan → checkout → bayar QRIS → ambil).

---

## Alur Penggunaan Utama

```
Beranda → Pilih Menu → Detail Menu → Tambah ke Keranjang
→ Keranjang → Checkout (pilih waktu & voucher) → Bayar QRIS
→ Konfirmasi → Pantau Status Pesanan
```

---

## Struktur Proyek

```
KantinGO/
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # Komponen UI yang dapat dipakai ulang
│   │   ├── pages/          # Halaman (Route)
│   │   ├── lib/
│   │   │   ├── api.ts      # Semua pemanggilan API ke backend
│   │   │   ├── auth/       # Login, token, Sanctum
│   │   │   ├── cart/       # Context keranjang belanja
│   │   │   ├── orders/     # Context pesanan
│   │   │   └── mock/       # Data mock (hanya aktif jika VITE_USE_MOCK=true)
│   │   └── main.tsx
│   └── .env                # Konfigurasi Vite (buat dari .env.example)
│
├── backend/                # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Controller API
│   │   ├── Http/Resources/         # API Resource (transformer)
│   │   └── Models/                 # Eloquent Models
│   ├── database/
│   │   ├── migrations/     # Skema tabel
│   │   └── seeders/        # Data demo
│   └── .env                # Konfigurasi Laravel (buat dari .env.example)
│
├── package.json            # Script root (pnpm dev, build, dll.)
└── pnpm-workspace.yaml
```

---

## Perintah Berguna

```bash
# Build frontend untuk produksi
pnpm build

# Cek TypeScript tanpa build
pnpm typecheck

# Reset database dan isi ulang seed (dari dalam backend/)
php artisan migrate:fresh --seed

# Tambah/ubah data via tinker (dari dalam backend/)
php artisan tinker

# Lihat semua route API
php artisan route:list --path=api
```

---

## Troubleshooting

### ❌ `SEED_PASSWORD belum diatur`
Isi `SEED_PASSWORD=password123` (atau nilai lain) di `backend/.env` sebelum menjalankan `db:seed`.

### ❌ CORS error di browser
Pastikan `FRONTEND_URL=http://localhost:5173` di `backend/.env` sudah benar dan backend berjalan di port 8000.

### ❌ `php artisan serve` port sudah dipakai
```bash
php artisan serve --port=8001
# lalu ubah VITE_API_URL=http://localhost:8001/api/v1 di frontend/.env
```

### ❌ Halaman putih / error di browser
Buka DevTools (F12) → Console untuk melihat pesan error. Pastikan backend berjalan dan `VITE_API_URL` sudah benar.

### ❌ `pdo_mysql` tidak ditemukan (Linux)
```bash
sudo apt install php8.3-mysql   # Ubuntu/Debian
sudo dnf install php-mysqlnd    # Fedora/RHEL
```

---

## Teknologi

| Lapisan | Teknologi |
|---------|-----------|
| Frontend | React 19, TypeScript, Vite 6, TailwindCSS 4, TanStack Query 5, React Router 7 |
| Backend | Laravel 11, PHP 8.3, Sanctum (auth token), MariaDB |
| Tools | pnpm 12, Composer 2, Concurrently |
