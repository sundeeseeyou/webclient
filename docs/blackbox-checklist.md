# Lembar Uji Black-Box — Boowat MVP

Skenario diambil dari PRD Bagian 13 (BB-01 s.d. BB-22). Isi kolom **Hasil** dengan `Pass` atau `Fail`, dan tulis temuan di kolom **Catatan**.

## Informasi pengujian

| Item | Isi |
|---|---|
| Tanggal pengujian | 1 Oktober 2026 |
| Penguji | Skrip pengujian otomatis berbasis browser (`scripts/e2e/blackbox.mjs`) |
| Alamat aplikasi | http://localhost:3000 (build produksi, `pnpm build && pnpm start`) |
| Browser & perangkat | Google Chrome (headless), layar 1440×900 |
| Versi (commit) | `ad7d595` |

## Persiapan

1. Jalankan `pnpm prisma db seed` sebelum pengujian agar data kembali ke kondisi awal. Tanggal di data demo dihitung dari hari seed dijalankan.
2. Akun yang dipakai:

| Peran | Email | Password | Data milik akun |
|---|---|---|---|
| Admin | `admin@boowat.com` | `admin123` | Semua data |
| Klien 1 | `klien1@contoh.com` | `klien123` | Klinik Gigi Senyum Sehat: senyumsehat.co.id, proyek "Redesain Halaman Layanan" (Menunggu Persetujuan) |
| Klien 2 | `klien2@contoh.com` | `klien123` | CV Kopi Nusantara: kopinusantara.co.id, belikopinusantara.com, proyek "Pembuatan Website Toko Online" |
| Klien 3 | `klien3@contoh.com` | `klien123` | Batik Laras Solo: batiklaras.com, proyek "Pemeliharaan Website Oktober" |

3. Untuk BB-08, cron dijalankan manual dengan perintah:
   `curl -H "Authorization: Bearer <CRON_SECRET>" <alamat aplikasi>/api/cron/daily`
   Nilai `CRON_SECRET` ada di `.env`.

## Skenario

| No | Fitur | Skenario | Langkah pengujian | Hasil yang diharapkan | Hasil | Catatan |
|---|---|---|---|---|---|---|
| BB-01 | Login | Email & password admin benar | Buka `/login`, isi `admin@boowat.com` / `admin123`, klik **Masuk**. | Masuk ke `/admin` (Beranda admin). | Pass | Bukti: `docs/bab4/blackbox/BB-01.jpg` |
| BB-02 | Login | Password salah | Buka `/login`, isi `admin@boowat.com` / `salah123`, klik **Masuk**. | Muncul pesan "Email atau password salah", tetap di `/login`. | Pass | Bukti: `docs/bab4/blackbox/BB-02.jpg` |
| BB-03 | Hak akses | Klien membuka `/admin` | Login sebagai klien 1, lalu ketik `/admin` di address bar. | Diarahkan ke `/portal`. | Pass | Bukti: `docs/bab4/blackbox/BB-03.jpg` |
| BB-04 | Hak akses | Klien A membuka URL proyek milik klien B | 1. Login admin, buka **Proyek** → "Pembuatan Website Toko Online", lalu salin ID di URL.<br>2. Keluar, login sebagai klien 1.<br>3. Buka `/portal/projects/<ID tadi>`. | Halaman "Halaman tidak ditemukan" (404). | Pass | Bukti: `docs/bab4/blackbox/BB-04.jpg` |
| BB-05 | Kelola klien | Admin tambah klien dengan data lengkap | 1. Login admin → **Klien** → **Tambah Klien**.<br>2. Isi data klien dan bagian **Akun login** (email baru, password minimal 8 karakter), klik **Simpan Klien**.<br>3. Keluar, lalu login dengan akun baru. | Klien muncul di daftar klien; akun baru bisa login dan masuk ke `/portal`. | Pass | Bukti: `docs/bab4/blackbox/BB-05.jpg` |
| BB-06 | Kelola klien | Admin tambah klien dengan email yang sudah dipakai akun lain | Ulangi BB-05, isi **Email login** dengan `klien1@contoh.com`, lalu klik **Simpan Klien**. | Muncul pesan "Email sudah dipakai akun lain" di kolom Email login; klien tidak bertambah di daftar. | Pass | Bukti: `docs/bab4/blackbox/BB-06.jpg` |
| BB-07 | Website | Admin input statistik bulan berjalan | 1. Login admin → **Klien** → Klinik Gigi Senyum Sehat → tab **Website** → senyumsehat.co.id.<br>2. Di **Input statistik bulanan**, pilih bulan ini, isi Pengunjung `2500`, klik **Simpan statistik**.<br>3. Login sebagai klien 1, buka **Beranda**. | "Pengunjung bulan ini" di dashboard klien menjadi 2.500. | Pass | Bukti: `docs/bab4/blackbox/BB-07.jpg` |
| BB-08 | Website | Domain habis ≤7 hari | 1. Login admin, buka website batiklaras.com → **Ubah**, lalu isi tanggal perpanjangan domain = 5 hari dari hari ini, **Simpan**.<br>2. Jalankan cron (lihat Persiapan no. 3).<br>3. Login sebagai klien 3, buka **Beranda** dan lonceng notifikasi. | Kartu website berwarna merah dengan "Habis dalam 5 hari", dan lonceng berisi notifikasi pengingat perpanjangan domain. | Pass | Bukti: `docs/bab4/blackbox/BB-08.jpg` |
| BB-09 | Proyek | Admin pindahkan task ke DONE | 1. Login admin → **Proyek** → "Pembuatan Website Toko Online", catat angka progres.<br>2. Tab **Sprint & Task**, pindahkan satu kartu ke kolom **Selesai** (tombol panah atau seret).<br>3. Login sebagai klien 2 → **Proyek**. | Progres proyek bertambah di admin, dan angka yang sama tampil di portal klien. | Pass | Bukti: `docs/bab4/blackbox/BB-09.jpg` |
| BB-10 | Pesan | Klien kirim pesan di proyek | 1. Login sebagai klien 1 → **Proyek** → "Redesain Halaman Layanan", tulis pesan, klik **Kirim**.<br>2. Login admin, buka lonceng notifikasi, klik notifikasi pesan. | Pesan tampil di tab **Pesan** proyek admin, dan admin mendapat notifikasi "Pesan baru dari Klinik Gigi Senyum Sehat". | Pass | Bukti: `docs/bab4/blackbox/BB-10.jpg` |
| BB-11 | Permintaan | Klien kirim form tanpa judul | Login sebagai klien 1 → **Permintaan** → **Ajukan Permintaan**. Isi semua kecuali **Judul**, lalu klik **Kirim Permintaan**. | Muncul pesan "Judul permintaan wajib diisi"; permintaan tidak terkirim. | Pass | Bukti: `docs/bab4/blackbox/BB-11.jpg` |
| BB-12 | Permintaan | Klien kirim permintaan prioritas Tinggi | 1. Ulangi BB-11 dengan judul terisi dan prioritas **Tinggi**, klik **Kirim Permintaan**.<br>2. Login admin, buka lonceng notifikasi dan **Permintaan**. | Status "Diajukan"; batas respon = 1 hari setelah diajukan; admin mendapat notifikasi "Permintaan baru". | Pass | Bukti: `docs/bab4/blackbox/BB-12.jpg` |
| BB-13 | Permintaan | Admin tolak permintaan tanpa alasan | Login admin → **Permintaan** → buka permintaan BB-12 → **Mulai tinjau** → **Tolak**. Kosongkan alasan, lalu klik **Tolak permintaan**. | Muncul pesan bahwa alasan penolakan wajib diisi; status tetap "Sedang Ditinjau". | Pass | Bukti: `docs/bab4/blackbox/BB-13.jpg` |
| BB-14 | Permintaan | Admin tolak dengan alasan | Ulangi BB-13 dengan alasan penolakan terisi (minimal 10 karakter). Lalu login sebagai klien 1 → **Permintaan**. | Klien melihat status "Ditolak" beserta alasannya. | Pass | Bukti: `docs/bab4/blackbox/BB-14.jpg` |
| BB-15 | Permintaan | Permintaan belum direspons melewati batas waktu | Login admin → **Permintaan**. Lihat permintaan "Tombol checkout tidak bisa diklik di HP" (data demo, prioritas Mendesak). | Badge merah "Melewati SLA" tampil dan permintaan berada di urutan teratas. | Pass | Bukti: `docs/bab4/blackbox/BB-15.jpg` |
| BB-16 | Approval | Klien klik "Setujui Hasil" pada proyek menunggu persetujuan | Login sebagai klien 1 → **Proyek** → "Redesain Halaman Layanan" → **Setujui Hasil**, lalu konfirmasi. | Status proyek "Selesai" dan tanggal persetujuan tercatat ("Disetujui pada …"). | Pass | Bukti: `docs/bab4/blackbox/BB-16.jpg` |
| BB-17 | Approval | Klien klik "Minta Revisi" | 1. Login admin → **Proyek** → "Pembuatan Website Toko Online" → ubah status menjadi **Menunggu Persetujuan**.<br>2. Login sebagai klien 2, buka proyek itu → **Minta Revisi** → isi form → **Kirim Permintaan Revisi**. | Permintaan revisi baru muncul di **Permintaan**, dan status proyek menjadi "Revisi". | Pass | Bukti: `docs/bab4/blackbox/BB-17.jpg` |
| BB-18 | Invoice | Admin generate invoice dari proyek | Login admin → **Proyek** → "Pemeliharaan Website Oktober" → tab **Invoice** → **Buat Invoice**. Isi item (deskripsi, jumlah, harga), lalu klik **Simpan sebagai Draf**. | Nomor invoice otomatis (format `INV/TAHUN/BULAN/0001`), klien dan proyek terisi otomatis, total sesuai item. | Pass | Bukti: `docs/bab4/blackbox/BB-18.jpg` |
| BB-19 | Invoice | Admin kirim invoice | Di detail invoice BB-18 klik **Kirim ke Klien** dan konfirmasi. Lalu login sebagai klien 3 → **Invoice**, dan buka lonceng notifikasi. | Klien melihat invoice tersebut dan mendapat notifikasi "Invoice baru". | Pass | Bukti: `docs/bab4/blackbox/BB-19.jpg` |
| BB-20 | Invoice | Klien unduh invoice | Login sebagai klien 3 → **Invoice** → **Unduh PDF** pada invoice BB-19. | File PDF terunduh dengan nomor, data klien, proyek, item, dan total yang benar. | Pass | Bukti: `docs/bab4/blackbox/BB-20.jpg` |
| BB-21 | Invoice | Invoice DRAFT | 1. Login admin → **Invoice**, filter status **Draf**, dan catat nomor invoice draf milik CV Kopi Nusantara.<br>2. Login sebagai klien 2 → **Invoice**. | Invoice draf tersebut tidak terlihat di portal klien. | Pass | Bukti: `docs/bab4/blackbox/BB-21.jpg` |
| BB-22 | Laporan | Klien unduh laporan bulanan | Login sebagai klien 2 → **Laporan**, pilih website kopinusantara.co.id dan bulan lalu, lalu klik **Unduh Laporan Bulanan**. | PDF terunduh berisi statistik pengunjung, artikel terbit, dan permintaan yang selesai di bulan tersebut. | Pass | Bukti: `docs/bab4/blackbox/BB-22.jpg` |

## Ringkasan

| Jumlah skenario | Pass | Fail |
|---|---|---|
| 22 | 22 | 0 |
