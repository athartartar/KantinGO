# KantinGO

KantinGO adalah aplikasi web pick-up makanan dari kantin mitra (monorepo pnpm: `frontend/` React + TypeScript + Vite, `backend/` Laravel API + MariaDB).

## Prasyarat (Instalasi Awal dari Nol)

Pastikan semua alat berikut terpasang di komputer Anda:

1. **Git**
2. **Node.js >= 22** dan **pnpm >= 12**:
   - Install Node.js 22+ dari [nodejs.org](https://nodejs.org/).
   - Aktifkan pnpm lewat Corepack (atau npm):
     ```bash
     corepack enable
     corepack prepare pnpm@12.18.0 --activate
     ```
     Cek versi: `node -v` dan `pnpm -v`.
3. **PHP >= 8.3** (ekstensi wajib: `pdo_mysql`, `mbstring`, `openssl`, `xml`, `curl`, `zip`, `ctype`, `fileinfo`, `tokenizer`) dan **Composer** ([getcomposer.org](https://getcomposer.org/)).
4. **MariaDB** & **phpMyAdmin** (bisa lewat XAMPP/Laragon di Windows, atau paket `mariadb-server` + `phpmyadmin` di Linux).

## Setup Database (MariaDB / phpMyAdmin)

1. Jalankan service MariaDB (dan Apache/Nginx jika memakai phpMyAdmin).
2. Buka **phpMyAdmin** (`http://localhost/phpmyadmin`) atau terminal MariaDB, lalu buat database baru bernama **`kantingo`** dengan collation **`utf8mb4_unicode_ci`**:
   ```sql
   CREATE DATABASE IF NOT EXISTS kantingo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## Langkah Menjalankan Project Pertama Kali

1. **Clone repositori**:
   ```bash
   git clone <URL_REPOSITORY>
   cd KantinGO
   ```

2. **Install dependensi frontend & root**:
   ```bash
   pnpm install
   ```

3. **Install dependensi backend**:
   ```bash
   cd backend
   composer install
   ```

4. **Konfigurasi environment backend**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Buka `backend/.env` dan sesuaikan jika perlu:
   - Untuk development lokal, ubah `APP_ENV=local` dan `APP_DEBUG=true`.
   - Pastikan kredensial database cocok dengan MariaDB Anda (`DB_CONNECTION=mariadb`, `DB_HOST=127.0.0.1`, `DB_DATABASE=kantingo`, `DB_USERNAME=root`, `DB_PASSWORD=`).
   - Pastikan `FRONTEND_URL=http://localhost:5173`.
   - **Jangan pernah commit file `.env` ke Git.**

5. **Jalankan migrasi database**:
   ```bash
   php artisan migrate
   cd ..
   ```

6. **Jalankan Frontend & Backend sekaligus** (dari folder root `KantinGO`):
   ```bash
   pnpm dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000` (prefix `/api/v1`, cek kesehatan di `GET http://localhost:8000/api/v1/health`)
   - Menjalankan terpisah: `pnpm dev:frontend` atau `pnpm dev:backend`.
