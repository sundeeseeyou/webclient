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

## Fase 1 — Proyek, Sprint & Task (PB-01) dan Pesan (PB-02)

| No | Keputusan | Alasan |
|---|---|---|
| 64 | Klien pemilik proyek tidak bisa diganti saat mengubah proyek; di dialog ubah, pilihan klien dikunci. | Pesan dan invoice proyek harus tetap milik klien yang sama. |
| 65 | Proyek yang sudah punya invoice tidak bisa dihapus (409, dengan saran mengubah status menjadi Ditunda). | Hapus berantai akan ikut menghapus catatan keuangan. |
| 66 | Proyek baru hanya untuk klien aktif, dan website yang dipilih harus milik klien itu. | Mencegah data proyek tertaut ke klien atau website yang salah. |
| 67 | Notifikasi "menunggu persetujuan" hanya dikirim saat status berubah menjadi Menunggu Persetujuan, bukan saat status yang sama disimpan ulang. | Mencegah notifikasi ganda ke klien. |
| 68 | Tanggal selesai proyek dan sprint harus ≥ tanggal mulai, juga ketika PATCH hanya mengirim salah satu tanggal (dibandingkan dengan nilai yang tersimpan). | Validasi sederhana yang konsisten di form dan API. |
| 69 | Task baru masuk kolom "Belum Dikerjakan" di urutan paling bawah. Saat dipindah, server menyisipkan task di posisi tujuan lalu menomori ulang kolom tujuan dalam satu transaksi. | `order` hanya dipakai sebagai urutan relatif. |
| 70 | Drag & drop memakai HTML5 native, tanpa library, dan hanya berlaku di dalam satu sprint. Di layar sentuh (tidak didukung HTML5 drag) yang dipakai tombol panah; di bawah 768px kolom kanban bertumpuk. Pemindahan bersifat optimistis dan kembali ke posisi semula bila API gagal. | PRD 7.2 meminta pindah status "via tombol atau drag". |
| 71 | Admin bebas memilih status proyek apa pun. | PRD tidak mengatur alur transisi status proyek; alur persetujuan klien dibuat di Fase 2. |
| 72 | Thread pesan diambil ulang seluruhnya setiap 15 detik saat tab aktif dan saat tab kembali aktif, tanpa paginasi. Ctrl+Enter mengirim pesan. | PRD 6.6: tidak realtime. Cukup untuk jumlah pesan per proyek di MVP. |
| 73 | Judul notifikasi pesan: "Pesan baru dari {perusahaan}" untuk admin dan "Pesan baru dari tim Boowat" untuk klien. Isinya nama proyek + cuplikan 80 karakter. Tautan untuk admin membuka tab Pesan (`?tab=pesan`). | PRD 6.6. |
| 74 | Portal klien memakai istilah "Tahapan Pekerjaan" (sprint) dan "pekerjaan" (task), dengan kalimat penjelas per status proyek. Detail task tidak ditampilkan ke klien. | PRD 7.3 dan aturan bahasa non-teknis di portal klien. |
| 75 | Kunci tab di URL memakai Bahasa Indonesia (`?tab=website|proyek|akun`, `?tab=ringkasan|sprint|pesan`), disimpan lewat `history.replaceState`. | Konsisten antar halaman; tautan notifikasi bisa langsung membuka tab tertentu. |
| 76 | Halaman detail di portal klien tidak memakai `loading.tsx`; skeleton dashboard ada di route group `portal/(home)` dan skeleton daftar proyek di `portal/projects/(list)`. | `loading.tsx` memulai streaming sebelum `notFound()` dipanggil, sehingga halaman "tidak ditemukan" terkirim dengan status 200. Portal klien adalah batas keamanan BB-04, jadi harus mengembalikan 404 asli. Detail di portal admin tetap memakai skeleton (soft 404 dapat diterima untuk admin). |

## Fase 2 — Fondasi

| No | Keputusan | Alasan |
|---|---|---|
| 77 | Target SLA memakai jam kalender (URGENT 4 jam, HIGH 1 hari, MEDIUM 3 hari, LOW 5 hari), disimpan di `lib/sla.ts`. | PRD 6.1 meminta hari kalender untuk MVP dan meminta keputusan ini dicatat. |
| 78 | Alur status permintaan mengikuti activity diagram secara ketat: `SUBMITTED → IN_REVIEW → APPROVED → IN_PROGRESS → DONE`; penolakan hanya dari `IN_REVIEW`. Transisi lain ditolak (400). | PRD 6.1. Admin harus meninjau dulu sebelum menyetujui atau menolak. |
| 79 | Invoice terlambat dihitung mulai hari setelah jatuh tempo (jatuh tempo 14 Okt → terlambat mulai 15 Okt 00:00 WIB). | Tanggal jatuh tempo masih termasuk hari pembayaran. |
| 80 | Invoice OVERDUE tetap bisa ditandai lunas atau dibatalkan. | PRD 6.4 hanya menyebut DRAFT/SENT, padahal OVERDUE adalah invoice SENT yang terlambat; tanpa ini invoice terlambat tidak bisa diselesaikan. |
| 81 | Nomor invoice diambil dari nomor terbesar dengan prefiks bulan yang sama; bila dua invoice dibuat bersamaan dan nomornya bentrok, penyimpanan diulang. | Kolom `number` unik di schema; urutan per bulan sesuai PRD 6.4. |
| 82 | PDF memakai font bawaan Helvetica dan kerangka bersama di `src/lib/pdf/` (header logo, footer nomor halaman). Gaya halaman PDF tidak memakai `lineHeight`. | Tanpa file font tambahan. `lineHeight` membuat react-pdf menaruh nomor halaman di luar kertas (sudah diuji). |
| 83 | Fase 2 kembali dikerjakan paralel oleh tiga agent (Invoice, Permintaan + persetujuan, Dashboard admin + laporan bulanan) dengan kontrak URL filter yang disepakati di awal: `/admin/requests?status=&priority=&clientId=&overdue=1`, `/admin/invoices?status=<status|unpaid>&clientId=`. | Dashboard admin menaut ke halaman milik agent lain. |

## Fase 2 — PB-03 Invoice

| No | Keputusan | Alasan |
|---|---|---|
| 84 | Nomor invoice dibuat di server dalam transaksi dan diulang sampai 3 kali bila bentrok; bila tetap bentrok → 409 "silakan simpan ulang". Bila bulan terbit sebuah draf diubah, nomornya dibuat ulang untuk bulan baru. | Nomor harus unik dan berurutan per bulan (PRD 6.4). |
| 85 | Isian item: harga satuan rupiah bulat (tanpa sen) maksimal 10 miliar, qty 1–10.000, maksimal 50 item, total di bawah 1 triliun; harga kosong ditolak. Jatuh tempo tidak boleh sebelum tanggal terbit. | Sesuai kolom `Decimal(14,2)` dan mencegah isian kosong tersimpan sebagai 0. |
| 86 | Draf yang jatuh temponya sudah lewat tidak bisa dikirim (400). | Invoice itu akan langsung terlambat begitu diterima klien. |
| 87 | Aksi kirim, tandai lunas, batal, dan ubah draf memakai syarat status lama (`updateMany`); klik ganda atau request bersamaan mendapat 409. | Notifikasi "invoice baru" tidak terkirim dua kali. |
| 88 | Invoice hanya bisa dibuat untuk proyek milik klien aktif, dan proyeknya tidak bisa diganti saat diubah. | Konsisten dengan #64 dan #66. |
| 89 | Filter status invoice memakai status efektif (SENT yang lewat jatuh tempo dihitung OVERDUE), dengan filter tambahan `unpaid` = SENT + OVERDUE. | `effectiveInvoiceStatus` menjadi satu-satunya sumber aturan. |
| 90 | Data penagih di PDF hanya "Boowat.com"; info rekening ditulis admin di kolom Catatan. | Sistem belum menyimpan alamat/rekening Boowat, dan data dummy dilarang (PRD 15.2). |
| 91 | Di portal, invoice tampil sebagai daftar baris bertumpuk (bukan tabel) dengan tombol Unduh PDF, tanpa halaman detail. Invoice terlambat diberi latar merah ringan. | Nyaman di HP; PRD 7.3 hanya meminta daftar dan unduh. |
| 92 | Tab Invoice di detail klien tidak punya tombol buat; invoice selalu dibuat dari proyek. | PRD 6.4: "Generate dari proyek". |
| 93 | Cron yang mengubah invoice menjadi OVERDUE tidak mengirim notifikasi. | Tidak diminta PRD. |

## Fase 2 — PB-05 Permintaan dan Persetujuan Proyek

| No | Keputusan | Alasan |
|---|---|---|
| 94 | Kotak masuk admin diurutkan: melewati SLA dulu, lalu yang masih terbuka menurut batas respon terdekat, lalu Selesai/Ditolak di bawah. Portal klien diurutkan dari yang terbaru. Tanpa paginasi. | PRD 7.2. Status terlambat dihitung, jadi pengurutan dilakukan di aplikasi. |
| 95 | Klien yang punya website wajib memilih website saat mengajukan permintaan; klien tanpa website tetap bisa mengajukan. | Menafsirkan website "opsional" di PRD 7.3. |
| 96 | `respondedAt` diisi sekali pada perubahan status pertama; `resolvedAt` diisi saat Selesai atau Ditolak. Alasan penolakan wajib, 10–1000 karakter. Tanggapan kosong tidak menghapus tanggapan lama. | PRD 6.1 dan BB-13. |
| 97 | Ubah status permintaan, setujui, dan minta revisi memakai syarat status lama; bila kalah balapan → 409 (permintaan) atau 400 (proyek). | Klik ganda atau dua admin bersamaan tidak saling menimpa. |
| 98 | Minta revisi dikerjakan dalam satu transaksi: buat permintaan (jenis awal Revisi Desain, website dan proyek diambil dari proyek), status proyek menjadi Revisi, dan tanggal persetujuan dikosongkan. | BB-17. |
| 99 | Notifikasi persetujuan memakai tipe baru `PROJECT_APPROVED`; notifikasi revisi memakai `NEW_REQUEST`. | Tipe lama tidak ada yang cocok. |
| 100 | Badge "Melewati SLA" hanya tampil di admin. Klien melihat perkiraan waktu respon dan tanggapan admin; tidak ada halaman detail permintaan di portal. | PRD 6.1 dan 7.3. |
| 101 | Deretan tab detail klien (kini 5 tab) bisa digeser ke samping di layar sempit. | Aturan 360px tanpa scroll halaman. |

## Fase 2 — Dashboard Admin dan Laporan Bulanan

| No | Keputusan | Alasan |
|---|---|---|
| 102 | Beranda admin ada di route group `admin/(dashboard)`, supaya skeleton `loading.tsx`-nya tidak ikut tampil di halaman admin lain. | `loading.tsx` membungkus semua sub-halaman di foldernya. |
| 103 | Kartu dashboard: proyek berjalan = Perencanaan, Sedang Dikerjakan, Menunggu Persetujuan, Revisi. Invoice belum lunas = SENT + OVERDUE beserta totalnya. Kartu domain/hosting ≤30 hari menghitung website milik klien aktif, termasuk yang sudah lewat. Kartu SLA berwarna merah hanya bila ada yang terlambat. | PRD 7.2. Semua angka dari database. |
| 104 | Daftar perpanjangan menampilkan domain/hosting yang habis dalam ≤60 hari atau sudah lewat; angka kartu ≤30 hari dihitung dari data yang sama. | Kartu dan daftar tidak pernah berbeda. |
| 105 | Pilihan bulan laporan berupa daftar 12 bulan terakhir berlabel Indonesia (default bulan lalu), bukan `input type="month"`. API menolak bulan di masa depan. | `input type="month"` tidak didukung Firefox/Safari desktop. |
| 106 | Laporan diunduh lewat `fetch` + blob agar error tampil sebagai toast dan tombol menampilkan "Menyiapkan laporan...". | Umpan balik saat PDF sedang dibuat. |
| 107 | Permintaan selesai di laporan = status DONE dengan tanggal selesai di bulan itu (WIB), milik website tersebut atau proyeknya, dan dibatasi klien pemilik website saat ini. Status proyek di laporan adalah status saat diunduh ("Status per {tanggal}"). | Riwayat status tidak disimpan. Pembatasan klien mencegah data klien lama bocor bila website dipindah (#54). |
| 108 | Nilai kosong di laporan ditulis "Belum ada data"; perbandingan ditulis "Belum bisa dibandingkan" bila data bulan lalu kosong. | PRD 15.1: tanpa angka dummy. |
| 109 | Tabel PDF tidak memotong baris antarhalaman; header tabel tidak diulang di halaman lanjutan. | Keterbatasan react-pdf yang dapat diterima untuk MVP. |

## Fase 3 — Rapikan dan Uji

| No | Keputusan | Alasan |
|---|---|---|
| 110 | Unit test memakai Vitest (environment `node`) di folder `tests/`, untuk empat file yang diminta PRD 11: `lib/sla.ts`, `lib/invoice.ts`, `lib/progress.ts`, `lib/rbac.ts`. `@types/node` dinaikkan ke versi 24. | Vitest 5 membutuhkan `@types/node` ≥ 22, dan runtime proyek sudah Node 24. |
| 111 | `lib/rbac.ts` diuji dengan session tiruan (`vi.mock` untuk `@/lib/auth` dan `next/navigation`). | Aturan akses bisa diuji tanpa database dan tanpa login sungguhan. |
| 112 | Halaman error berbahasa Indonesia di `app/error.tsx`, `app/admin/error.tsx`, `app/portal/error.tsx`, dan `app/global-error.tsx`. Isinya hanya kode kesalahan (digest), bukan pesan asli, dengan tombol "Coba lagi" yang memakai `retry()` Next 16. | Tanpa ini error server tampil dengan pesan bawaan Next berbahasa Inggris (PRD 15.1). Pesan asli bisa membocorkan detail teknis. Diuji dengan mematikan database lalu menyalakannya kembali. |
| 113 | Halaman form tambah website dan ajukan permintaan diberi skeleton lewat komponen bersama `FormPageSkeleton`. | PRD 15.4 #5: setiap halaman punya keadaan loading. |
| 114 | Kode mati diaudit dengan `knip` yang dijalankan sekali lewat `pnpm dlx` (tidak dipasang). Ekspor yang tidak dipakai dihapus, atau kata `export`-nya dihapus bila hanya dipakai di file sendiri. Ekspor sisa di `components/ui/*` dibiarkan karena bagian komponen shadcn. `@auth/core` tetap dipasang (lihat #7) walau terdeteksi tidak terpakai. | PRD 15.3: tanpa kode mati dan library yang tidak dipakai. |
| 115 | Migrasi database production dijalankan manual dari laptop (`prisma migrate deploy` dengan connection string direct), bukan otomatis saat build Vercel. | Build preview Vercel tidak boleh ikut mengubah database production. Koneksi pooled (PgBouncer) tidak cocok untuk migrasi. |
