# Boowat — Sistem Manajemen Proyek dan Klien

Web app untuk web agency Boowat.com dengan dua portal:

- **Portal Admin** (`/admin`): dashboard ringkasan, kelola klien dan akun login, website (domain, hosting, statistik pengunjung, artikel), proyek dengan sprint dan papan kanban, pesan proyek, kotak masuk permintaan dengan target waktu respon (SLA), dan invoice.
- **Portal Klien** (`/portal`): pantau website dan proyek, kirim pesan, ajukan permintaan perubahan, setujui hasil kerja atau minta revisi, unduh invoice dan laporan bulanan (PDF).

Teknologi: Next.js 16 (App Router), TypeScript, PostgreSQL + Prisma 6, Auth.js v5, Tailwind CSS v4 + shadcn/ui, Zod, react-hook-form, Recharts, @react-pdf/renderer, Vitest.

## Kebutuhan

- Node.js 24
- pnpm 10
- Docker (untuk PostgreSQL lokal)

## Instalasi

```bash
pnpm install
cp .env.example .env
```

Isi `.env`:

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Koneksi PostgreSQL. Nilai contoh sudah cocok dengan `docker-compose.yml`. |
| `AUTH_SECRET` | Kunci acak untuk session, buat dengan `openssl rand -base64 32`. |
| `CRON_SECRET` | Kunci acak untuk endpoint cron harian. |
| `APP_URL` | Alamat aplikasi, contoh `http://localhost:3000`; dipakai untuk tautan di email. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Opsional. Bila kosong, notifikasi hanya tampil di aplikasi. |
| `GA4_CLIENT_EMAIL`, `GA4_PRIVATE_KEY` | Opsional. Bila kosong, statistik pengunjung diisi manual oleh admin. |

## Database, migrasi, dan seed

```bash
docker compose up -d          # PostgreSQL di localhost:5434
pnpm prisma migrate dev       # buat tabel
pnpm prisma db seed           # isi data demo (menghapus data lama, aman dijalankan ulang)
```

Tanggal di data demo dihitung dari hari seed dijalankan, sehingga permintaan yang terlambat dan domain yang hampir habis selalu tersedia untuk demo.

## Menjalankan

```bash
pnpm dev                      # http://localhost:3000
```

Pemeriksaan sebelum commit:

```bash
pnpm typecheck                # next typegen + tsc
pnpm lint
pnpm test                     # unit test Vitest untuk lib/sla, lib/invoice, lib/progress, lib/rbac
pnpm build
```

## Akun demo

| Peran | Email | Password |
|---|---|---|
| Admin | `admin@boowat.com` | `admin123` |
| Klien — Klinik Gigi Senyum Sehat | `klien1@contoh.com` | `klien123` |
| Klien — CV Kopi Nusantara | `klien2@contoh.com` | `klien123` |
| Klien — Batik Laras Solo | `klien3@contoh.com` | `klien123` |

## Deploy ke Vercel

1. Buat database PostgreSQL online (Neon atau Supabase).
   - Untuk aplikasi di Vercel, pakai connection string **pooled** (Neon: host berakhiran `-pooler`, tambahkan `?sslmode=require&pgbouncer=true`).
   - Untuk migrasi, pakai connection string **direct**.
2. Dari laptop, jalankan migrasi ke database production, lalu isi data demo bila perlu:
   ```bash
   DATABASE_URL="<connection string direct>" pnpm prisma migrate deploy
   DATABASE_URL="<connection string direct>" pnpm prisma db seed   # opsional
   ```
3. Import repo ke Vercel dan isi semua environment variable di atas. `APP_URL` diisi alamat Vercel, misalnya `https://boowat.vercel.app`. Build berjalan dengan `pnpm build`; Prisma Client dibuat otomatis lewat `postinstall`.
4. Cron harian di `vercel.json` berjalan pukul 01:00 UTC (08:00 WIB) dan memanggil `/api/cron/daily` dengan header `Authorization: Bearer <CRON_SECRET>`. Tugasnya:
   - membuat pengingat perpanjangan domain/hosting (30 dan 7 hari),
   - menandai invoice yang lewat jatuh tempo,
   - menyinkronkan pengunjung dari GA4.
5. Setiap kali ada migrasi baru, ulangi langkah 2 sebelum deploy.

## Dokumen

| Dokumen | Isi |
|---|---|
| [`docs/prd-web.md`](docs/prd-web.md) | Kebutuhan produk (PRD). |
| [`docs/req-update.md`](docs/req-update.md) | Permintaan tambahan: desain dan UI/UX. |
| [`DECISIONS.md`](DECISIONS.md) | Keputusan teknis dan penyesuaian terhadap PRD. |
| [`docs/catatan-kode.md`](docs/catatan-kode.md) | File utama dan alur kode tiap fitur. |
| [`docs/blackbox-checklist.md`](docs/blackbox-checklist.md) | Lembar uji black-box BB-01 s.d. BB-22. |
