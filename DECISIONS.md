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

## Fase 1 — Desain ulang (docs/req-update.md) dan fondasi

`docs/req-update.md` adalah permintaan tambahan dari pemilik proyek. Bila bertentangan dengan PRD 15.1, yang dipakai adalah req-update.

| No | Keputusan | Alasan |
|---|---|---|
| 31 | Layout meniru TailAdmin: sidebar putih dengan label "MENU" yang bisa diciutkan (statusnya disimpan di cookie `sidebar-collapsed` agar tidak berkedip saat reload), header berisi tombol sidebar, lonceng, dan menu pengguna, serta konten `max-w-7xl` di tengah | req-update Desain #1. Fitur TailAdmin yang tidak berfungsi di MVP (pencarian, dark mode) tidak ikut dibuat. |
| 32 | Radius 8px untuk tombol/input, 12px untuk kartu/dialog; `shadow-xs` untuk kartu/input, `shadow-sm` untuk dialog/popover | req-update Desain #2 menggantikan aturan `rounded-md` tanpa bayangan di PRD 15.1. |
| 33 | Font heading **Gabarito**, isi **Plus Jakarta Sans** | req-update menulis "Gabarino", yang tidak ada di Google Fonts; dianggap salah ketik dari Gabarito. |
| 34 | Ikon memakai `react-icons/pi` (Phosphor); `lucide-react` dihapus dan ikon di komponen shadcn diganti manual | req-update Desain #4. `components.json` masih menyebut lucide, jadi komponen shadcn yang ditambah nanti harus diganti ikonnya secara manual. |
| 35 | Halaman login side-by-side: form di kiri, panel warna primary di kanan (disembunyikan di bawah 1024px) | req-update Desain #5. Panel hanya berisi deskripsi fungsional aplikasi, tanpa teks marketing (PRD 15.1). |
| 36 | Transisi modal, sheet, popover, dropdown, dan select ditulis sebagai CSS keyframes di `globals.css`, berdasarkan atribut `data-slot`/`data-state` Radix; menghormati `prefers-reduced-motion` | req-update UI/UX #2 meminta modal dengan transisi halus. Tanpa library animasi, dan elemen halaman biasa tetap tanpa animasi masuk (PRD 15.1). Menggantikan keputusan #22 khusus untuk overlay. |
| 37 | Logo sementara berupa kotak "B" (primary dengan huruf secondary) + teks Boowat | Pengganti logo sampai file logo tersedia (lanjutan #21). Secondary juga dipakai sebagai aksen di panel login. Menu aktif memakai tint primary ala TailAdmin, menggantikan garis secondary di #20. |
| 38 | Library tambahan: `react-icons` (req-update), `sonner` untuk toast berhasil/gagal, dan `recharts` (PRD), semuanya dipasang di awal Fase 1 | `sonner` dipakai karena umpan balik setelah menyimpan adalah kebutuhan UX dasar (req-update UI/UX #1) dan merupakan toast yang direkomendasikan shadcn/ui. Semua library dipasang sekaligus agar lockfile tidak bentrok saat fitur dikerjakan paralel. |
| 39 | Validasi form: skema Zod per entitas di `lib/validations/`, dengan helper bersama di `common.ts` dan pesan bawaan Zod berbahasa Indonesia (`z.locales.id`) | req-update UI/UX #3. Skema dibuat idempoten: tanggal tetap string `YYYY-MM-DD` dan diubah ke `Date` di route handler, karena form memvalidasi di browser lalu API memvalidasi ulang. |
| 40 | Lonceng notifikasi kini bisa diklik (menandai dibaca lalu membuka tautannya), punya "Tandai semua dibaca", dan diperbarui tiap 30 detik saat tab aktif | Menggantikan #26 setelah API `/api/notifications` dibuat. Tidak realtime, sesuai PRD 2.2. |
| 41 | Email notifikasi dikirim lewat REST API Resend memakai `fetch`, tanpa SDK `resend` | Menghindari library baru. Tanpa `RESEND_API_KEY`/`EMAIL_FROM` hanya notifikasi di aplikasi, dan gagal kirim email tidak membatalkan notifikasi. |
| 42 | API mengembalikan 401 bila belum login, 403 bila role salah, dan 404 untuk data milik klien lain | 404 dipakai sesuai PRD 4 agar keberadaan data klien lain tidak bocor. |
| 43 | Fase 1 dikerjakan paralel oleh tiga agent di git worktree terpisah, masing-masing dengan database sendiri (`boowat_a`, `boowat_b`, `boowat_c`), lalu digabung ke `main` | Permintaan pemilik proyek. Database terpisah mencegah seed ulang satu agent menghapus data uji agent lain. |

## Fase 1 — PB-01 Kelola Klien

| No | Keputusan | Alasan |
|---|---|---|
| 44 | Akun login di form "Tambah Klien" bersifat opsional (checkbox "Buatkan akun login", aktif secara default). Klien dan akunnya disimpan dalam satu transaksi. | PRD 7.2 meminta form klien sekaligus akun login, tapi klien bisa saja dicatat sebelum membutuhkan akses. |
| 45 | Email login yang sudah dipakai mengembalikan 409 dengan pesan "Email sudah dipakai akun lain" di kolom email login. Email dicek lebih dulu, lalu error unik Prisma (P2002) juga ditangkap untuk request bersamaan. | BB-06. Uji 4 request serentak dengan email sama: satu tersimpan, tiga ditolak, tidak ada data klien yatim. |
| 46 | Email kontak klien (`Client.email`) tidak harus unik dan terpisah dari email login. | Satu PIC bisa mengurus beberapa perusahaan; yang harus unik hanya email login (`User.email`). |
| 47 | Kolom "Password awal" ditampilkan sebagai teks biasa. | Admin perlu memeriksa password sebelum menyampaikannya ke klien. |
| 48 | Menonaktifkan klien memakai DELETE (soft delete `isActive=false`); mengaktifkan kembali memakai PATCH `{ isActive: true }`. Klien nonaktif tetap tampil di daftar dengan badge "Nonaktif". | PRD 8. Data riwayat klien tetap tersimpan. |
| 49 | Sesi klien yang sedang berjalan langsung berakhir begitu kliennya dinonaktifkan: callback `jwt` Auth.js memeriksa `Client.isActive` di setiap request klien dan menghapus sesi bila tidak aktif. | Tanpa ini klien nonaktif tetap bisa memakai portal sampai sesinya habis (30 hari). Biayanya satu query ringan per request klien. |
| 50 | Pencarian klien hanya berdasarkan nama PIC dan nama perusahaan, tanpa paginasi. | PRD 7.2; jumlah klien agency masih puluhan. |
| 51 | Tab di detail klien disimpan di `?tab=` memakai `history.replaceState`. | Tautan bisa dibagikan tanpa menambah riwayat tombol Back. |
| 52 | Tab "Akun Login" hanya bisa menambah akun; ubah, hapus, dan reset password belum dibuat. | Di luar daftar API PRD 8. |

## Fase 1 — PB-04 Data Website

| No | Keputusan | Alasan |
|---|---|---|
| 53 | Domain dinormalkan: huruf kecil, tanpa `http(s)://` dan `/` di akhir (awalan `www.` tidak dibuang). Domain yang sudah terdaftar mengembalikan 409. | Kolom `domain` unik di schema. |
| 54 | Pemilik website bisa dipindah ke klien lain yang aktif lewat form ubah. | Menangani salah input tanpa harus menghapus data statistik website. |
| 55 | Kunci anti-dobel pengingat perpanjangan memuat tanggal jatuh tempo: `renew:{websiteId}:{domain|hosting}:{30|7}:{YYYY-MM-DD}`, lalu `:{userId}` ditambahkan oleh `notifyUsers`. | Tanpa tanggal, pengingat untuk periode tahun berikutnya tidak akan pernah terkirim karena kuncinya sudah terpakai. |
| 56 | Tahap pengingat: sisa 8–30 hari masuk tahap 30; sisa ≤7 hari (termasuk yang sudah lewat) masuk tahap 7. Setiap tahap terkirim sekali, hanya untuk website milik klien aktif. | PRD 6.5. Cron yang terlewat sehari tetap mengirim pengingat di hari berikutnya. |
| 57 | Klien hanya melihat artikel berstatus Terbit, juga lewat API. Artikel Terbit tanpa tanggal disimpan dengan tanggal hari ini. | Draf adalah pekerjaan internal agency. |
| 58 | Statistik bulanan: bulan tidak boleh melewati bulan berjalan (WIB), isian kosong ditolak (bukan disimpan sebagai 0), dan nilai maksimal 1 miliar. | `z.coerce` mengubah isian kosong menjadi 0, yang akan tampil sebagai data palsu. |
| 59 | Pageview disebut "Tampilan halaman" di seluruh UI, termasuk admin. | Konsisten Bahasa Indonesia (PRD 15.1). |
| 60 | Sinkron WordPress mengambil maksimal 100 post terbaru tanpa paginasi. Tanggal post dibaca sebagai WIB, judul dibersihkan dari tag dan entity HTML, dan kegagalan mengembalikan 502 dengan pesan ramah. Artikel WordPress yang dihapus manual akan muncul lagi pada sinkron berikutnya. | Cukup untuk MVP; upsert berdasarkan id post WordPress. |
| 61 | Sinkron GA4 hanya untuk bulan berjalan, dan hasilnya menimpa input manual bulan itu (sumber GA4). Adapter memakai JWT service account yang ditandatangani `node:crypto`, tanpa library Google. Belum diuji dengan kredensial asli. | PRD 6.5; tanpa kredensial, adapter langsung selesai tanpa request. |
| 62 | Grafik pengunjung berupa batang tunggal tanpa animasi. Bulan tanpa data tidak diberi batang dan tooltip-nya "Belum ada data"; label sumbu dua baris agar 6 bulan muat di layar 360px. | PRD 15.1: tanpa angka dummy dan tanpa animasi. |
| 63 | Di dashboard klien, proyek aktif (status selain Selesai) tampil di kartu website masing-masing, sedangkan banner "menunggu persetujuan" mencakup semua proyek klien. Perbandingan dengan bulan lalu disembunyikan bila data bulan lalu kosong. Warna kartu mengikuti masa aktif yang paling mendesak. | PRD 7.3. |
