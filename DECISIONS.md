# Catatan Keputusan

Keputusan yang menyimpang dari PRD (`docs/prd-web.md`) atau mengisi hal yang tidak diatur PRD.

## Fase 0 — Setup

| No | Keputusan | Alasan |
|---|---|---|
| 1 | `src/proxy.ts`, bukan `middleware.ts` | Next.js 16 mengganti nama file konvensi `middleware` menjadi `proxy`. Fungsinya sama dan berjalan di runtime Node.js. |
| 2 | Warna `primary` dan token lain ditulis di `src/app/globals.css` (`:root` + `@theme inline`), bukan `tailwind.config` | Tailwind CSS v4 tidak memakai file config. |
| 3 | Perintah memakai `pnpm` (`pnpm typecheck`, `pnpm prisma migrate dev`), bukan `npm`/`npx` | Proyek dibuat dengan pnpm (`packageManager` dan `pnpm-lock.yaml`). |
| 4 | Prisma versi 6.19 | Schema di PRD Bagian 5 (`prisma-client-js`, `url` di datasource) bisa dipakai apa adanya. Prisma 7 ke atas mewajibkan `prisma.config.ts` dan driver adapter. |
| 5 | Enum di `schema.prisma` ditulis satu nilai per baris | PRD menulis enum dalam satu baris (`enum Role { ADMIN CLIENT }`) dan sintaks itu ditolak Prisma. Isi enum tidak berubah. |
| 6 | Auth.js memakai `next-auth@5` (beta) | Hanya versi 5 yang menyediakan `auth()` untuk App Router dan mendukung Next.js 16. |
| 7 | `@auth/core` ditambahkan sebagai devDependency dengan versi yang sama persis dengan milik `next-auth` | Hanya untuk tipe. pnpm tidak meng-hoist `@auth/core`, sehingga tipe `JWT` (role, clientId) tidak bisa diperluas tanpa paket ini. Saat `next-auth` di-upgrade, samakan versinya. |
| 8 | Database lokal lewat `docker-compose.yml` pada port **5434** | Port 5432 dan 5433 di laptop pengembang sudah dipakai Postgres lain. |
| 9 | Seed ditulis di `prisma/seed.mts` dan dijalankan dengan `node` (TypeScript native Node 24) | Tidak perlu menambah `tsx`. Ekstensi `.mts` menghindari peringatan tipe modul dari Node. |
| 10 | `pnpm typecheck` = `next typegen && tsc --noEmit` | Tipe route Next.js 16 (`LayoutProps`, dll.) harus dibuat dulu sebelum `tsc`. |
| 11 | `/` untuk pengguna yang belum login diarahkan ke `/login`; yang sudah login diarahkan ke `/admin` atau `/portal` | PRD hanya menyebut redirect ke `/login`. Pengguna yang sudah login tidak perlu melihat form login lagi. |
| 12 | Setelah login berhasil, server action langsung redirect ke `/admin` atau `/portal` sesuai role | Redirect bertingkat lewat `/` membuat URL browser tertahan di `/`. |
| 13 | Pengguna dengan role yang salah diarahkan ke portalnya sendiri (klien membuka `/admin` → `/portal`) | Sesuai BB-03. Yang belum login diarahkan ke `/login`. |
| 14 | Layout admin dan portal memeriksa ulang role lewat `requireAdmin()` / `requireClient()` | Dokumentasi Next.js menyebut proxy hanya pemeriksaan awal, bukan satu-satunya lapisan otorisasi. |
| 15 | Email login dinormalkan ke huruf kecil dan spasi di ujung dibuang | Supaya `Klien1@contoh.com` dan `klien1@contoh.com` dianggap sama. Email yang disimpan juga harus huruf kecil (berlaku untuk form klien di Fase 1). |
| 16 | Akun klien yang perusahaannya dinonaktifkan (`isActive = false`) tidak bisa login | Penonaktifan klien di PRD bersifat soft delete, jadi aksesnya harus ikut dicabut. |
| 17 | `trustHost: true` di konfigurasi Auth.js | Agar `pnpm start` di lokal berjalan tanpa `AUTH_TRUST_HOST`. Di Vercel nilai ini memang otomatis aktif. |
| 18 | Warna: primary `#301193`, secondary `#B5E41B`, latar `#f6f7f8`, teks `#030303` | Warna brand dari pemilik proyek. |
| 19 | Warna status diturunkan dari harmoni brand: success `#147A35` dan danger `#C0381A` (triadik primary), info `#1F4FD1` (analog primary), warning `#9A6A00` (analog secondary) | Primary dan secondary saling komplementer. Semua warna status punya kontras ≥ 4.5 terhadap putih. |
| 20 | Secondary (hijau lime) hanya dipakai sebagai aksen kecil, misalnya garis penanda menu aktif | PRD 15.1 meminta satu warna utama; lime terlalu terang untuk latar besar atau teks. |
| 21 | Logo berupa wordmark teks "Boowat" berwarna primary | Belum ada file logo. Nanti cukup ganti isi `src/components/shared/wordmark.tsx`. |
| 22 | Class animasi shadcn (`animate-in/out`, `fade`, `zoom`, `slide`), paket `tw-animate-css`, dan dukungan dark mode dihapus | PRD 15.1: tanpa library animasi dan tanpa dark mode. |
| 23 | shadcn/ui versi ini memakai paket `cn` (dari tim shadcn) untuk menggabungkan class | Pengganti `clsx` + `tailwind-merge` yang dipasang otomatis oleh shadcn. |
| 24 | Recharts, `@react-pdf/renderer`, dan Vitest belum dipasang | Dipasang di fase yang memakainya, agar tidak ada library yang terpasang tapi tidak dipakai (PRD 15.3). |
| 25 | `lib/labels.ts` berisi label semua enum, label menu, dan teks UI yang dipakai bersama | Teks yang hanya muncul di satu komponen tetap ditulis di komponen itu, supaya `labels.ts` tidak menjadi daftar yang terlalu besar. |
| 26 | Di Fase 0 lonceng notifikasi hanya menampilkan 5 notifikasi terbaru, belum bisa diklik atau ditandai dibaca | Tautan notifikasi mengarah ke halaman yang baru dibuat di Fase 1–2. Fitur tandai dibaca ikut dibuat bersama API `/api/notifications`. |
| 27 | Login memakai server action yang memanggil `signIn` Auth.js, bukan route handler buatan sendiri | Auth.js sudah menyediakan route handler-nya sendiri (`/api/auth/[...nextauth]`). Route handler untuk CRUD tetap mengikuti PRD Bagian 8. |
| 28 | Cek grep PRD 15.4 #1 mengecualikan nilai enum `TaskStatus.TODO`; yang dicari hanya komentar TODO (`//.*TODO`) | `TODO` adalah nilai enum dari schema PRD dan pasti muncul di kode kanban. |
| 29 | Cek emoji PRD 15.4 #2 dijalankan dengan Node, bukan `grep -P` | `grep -P` di Git Bash Windows salah membaca pola `\x{...}` sehingga semua baris dianggap cocok. |
| 30 | `prisma/seed.mts` dibiarkan lebih dari 200 baris | Isinya hampir seluruhnya data demo. Batas 200 baris di PRD 15.3 ditujukan untuk file halaman dan komponen. |
