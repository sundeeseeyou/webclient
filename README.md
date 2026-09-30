# Boowat — Sistem Manajemen Proyek dan Klien

Web app untuk web agency Boowat.com dengan dua portal:

- **Portal Admin** (`/admin`): kelola klien, website, proyek, sprint & task, invoice, dan permintaan klien.
- **Portal Klien** (`/portal`): pantau website & proyek, ajukan permintaan, setujui hasil kerja, unduh invoice.

Acuan kebutuhan: [`docs/prd-web.md`](docs/prd-web.md). Keputusan teknis: [`DECISIONS.md`](DECISIONS.md).

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
| `RESEND_API_KEY`, `EMAIL_FROM` | Opsional, untuk email notifikasi. |
| `GA4_CLIENT_EMAIL`, `GA4_PRIVATE_KEY` | Opsional, untuk sinkron pengunjung dari Google Analytics. |
| `APP_URL` | Alamat aplikasi, contoh `http://localhost:3000`. |

## Database, migrasi, dan seed

```bash
docker compose up -d          # PostgreSQL di localhost:5434
pnpm prisma migrate dev       # buat tabel
pnpm prisma db seed           # isi data demo (aman dijalankan ulang)
```

## Menjalankan

```bash
pnpm dev                      # http://localhost:3000
```

Pemeriksaan sebelum commit:

```bash
pnpm typecheck
pnpm lint
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

1. Buat database PostgreSQL online (Neon atau Supabase), lalu salin connection string-nya.
2. Import repo ini ke Vercel dan isi environment variable seperti di atas.
3. Jalankan migrasi ke database production dengan `DATABASE_URL` production: `pnpm prisma migrate deploy`.
4. Cron harian (`vercel.json`, pukul 08:00 WIB) memanggil `/api/cron/daily` dengan header `Authorization: Bearer CRON_SECRET` untuk pengingat perpanjangan domain/hosting dan sinkron GA4.
