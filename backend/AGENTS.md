# Rules for Backend KantinGO

- Dilarang ada komentar di kode (//, /* */, JSDoc). Penamaan harus self-explanatory.
- Identifier bahasa Inggris, pesan response/error untuk user bahasa Indonesia.
- Layer: route (HTTP saja) -> service (logika bisnis) -> query Drizzle. Route tanpa logika/query.
- Validasi input Zod via @hono/zod-validator, schema di src/validators/.
- Tanpa any. Pakai $inferSelect/$inferInsert.
- Fungsi kecil satu tanggung jawab. Tanpa magic value, taruh di src/config/constants.ts.
- Uang = integer Rupiah. PK = UUID. createdAt/updatedAt pakai timezone.
- Index untuk FK, status, slug, kolom search.
- Operasi multi-tabel wajib dalam satu transaksi.
- Response: sukses { success: true, data }, gagal { success: false, message }. Error lewat class AppError + error-handler terpusat.
- Semua route di-chain lewat .route() agar AppType (export di src/index.ts) tetap valid untuk Hono RPC.
- Target Vercel serverless: pool DB kecil, tanpa state di memory, SSL Aiven.
- Struktur: src/{config,db,lib,middleware,validators,services,routes}. db/schema dipecah per domain + schema/index.ts.
- Di akhir tiap batch jalankan pnpm typecheck sampai bersih dan pastikan tidak ada komentar tersisa.
