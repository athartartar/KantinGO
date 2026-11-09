# KantinGO

KantinGO adalah aplikasi web pick-up makanan dari kantin mitra. Dirancang dengan tampilan antarmuka ala aplikasi mobile yang tetap rapi dan responsif di layar desktop.

## Tech Stack

- **Runtime & Package Manager**: Node.js 22, pnpm (Workspace Monorepo)
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Lucide React, TanStack Query
- **Backend**: Hono, TypeScript, Drizzle ORM, `@hono/node-server`
- **Database**: PostgreSQL di Aiven
- **Deployment**: Vercel (dua project terpisah untuk frontend dan backend)

## Prasyarat & Cara Menjalankan

### Prasyarat
- Node.js versi 22 atau lebih baru (`node -v`)
- pnpm versi 12 atau lebih baru (`pnpm -v`)

### Langkah Instalasi dan Menjalankan

1. Clone repositori:
   ```bash
   git clone <URL_REPOSITORY>
   cd KantinGO
   ```

2. Pasang seluruh dependensi:
   ```bash
   pnpm install
   ```

3. Konfigurasi Environment Variable:
   Salin file konfigurasi di folder backend:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Isi `DATABASE_URL` di `backend/.env` sesuai kredensial PostgreSQL Anda. **PENTING: Jangan pernah melakukan commit file `.env` ke Git!**

4. Menjalankan Server Pengembangan:
   - **Menjalankan Frontend & Backend sekaligus**:
     ```bash
     pnpm dev
     ```
     Perintah ini akan menjalankan frontend di `http://localhost:5173` dan backend di `http://localhost:3000`. Permintaan frontend ke `/api` akan otomatis di-proxy ke backend.
   - **Hanya menjalankan Frontend**:
     Jika Anda hanya berfokus pada pengerjaan tampilan atau komponen frontend, Anda cukup menjalankan:
     ```bash
     pnpm dev:frontend
     ```
     Halaman akan tetap berjalan dengan aman (menampilkan state loading/error pada pemanggilan data hingga backend dan database tersedia).
   - **Hanya menjalankan Backend**:
     ```bash
     pnpm dev:backend
     ```

## Struktur Folder

```text
KantinGO/
├── backend/
│   ├── src/
│   │   ├── db/              # Inisialisasi koneksi PostgreSQL & skema Drizzle ORM
│   │   ├── routes/          # Definisi route Hono (misal /menus)
│   │   ├── dev.ts           # Runner lokal server (port 3000)
│   │   └── index.ts         # Inisialisasi aplikasi Hono & export AppType
│   ├── drizzle.config.ts    # Konfigurasi migrasi Drizzle Kit
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Komponen antarmuka (misal AppLayout)
│   │   ├── lib/             # Hono RPC client (api.ts)
│   │   ├── pages/           # Halaman aplikasi (Home, Cart, Voucher, dll.)
│   │   ├── index.css        # Konfigurasi Tailwind CSS v4
│   │   └── main.tsx         # Routing & inisialisasi aplikasi
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json          # Aturan rewrites untuk proxy & SPA
│   └── vite.config.ts
├── package.json             # Root monorepo configuration
├── pnpm-workspace.yaml      # Monorepo workspace configuration
├── .gitignore
├── .nvmrc
└── README.md
```

## Pembagian Area Kerja

- Folder `frontend/` dan `backend/` dikerjakan secara terpisah.
- Komunikasi antara frontend dan backend berjalan melalui endpoint `/api`.
- Tipe data terintegrasi secara end-to-end melalui Hono RPC (`AppType` yang diekspor dari paket `@kantingo/backend` dan diimpor oleh `@kantingo/frontend/src/lib/api.ts`), menjamin type safety penuh tanpa perlu duplikasi kontrak data.

## Aturan Git & Alur Kolaborasi

1. Branch utama adalah `main`.
2. Setiap pekerjaan fitur baru harus dibuat di branch terpisah dengan format `feature/nama-fitur`.
3. Penggabungan kode ke branch `main` dilakukan melalui Pull Request (PR) setelah lolos pengecekan typecheck.
4. Jangan pernah commit file `.env` atau kredensial rahasia apa pun.

## Catatan Deploy ke Vercel

Proyek ini dideploy sebagai dua project terpisah di Vercel dari repositori Git yang sama:

1. **Backend**:
   - Buat project baru di Vercel, pilih repositori KantinGO.
   - Set **Root Directory** ke `backend`.
   - Tambahkan Environment Variable `DATABASE_URL` pada pengaturan project backend.
2. **Frontend**:
   - Buat project baru di Vercel, pilih repositori KantinGO.
   - Set **Root Directory** ke `frontend`.
   - Setelah project backend ter-deploy dan mendapatkan URL (misalnya `https://kantingo-api.vercel.app`), perbarui nilai tujuan rewrite pada file `frontend/vercel.json`:
     ```json
     {
       "rewrites": [
         {
           "source": "/api/:path*",
           "destination": "https://kantingo-api.vercel.app/api/:path*"
         },
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
     ```
