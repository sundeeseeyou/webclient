# Perangkat User Acceptance Testing (UAT) — Boowat MVP

Dokumen ini dipakai untuk menjalankan UAT dengan pengguna sungguhan (admin dan klien Boowat.com). Hasilnya dipakai untuk mengisi sub-bab UAT dan Tabel 4.2 di `docs/bab4/hasil-pengujian.md`.

> Sesuaikan aspek, pernyataan, dan kategori penilaian dengan sub-bab 2.1.7 dan 2.4.2 skripsi. Bila berbeda, ikuti BAB II.

## 1. Persiapan

1. Responden: semua admin Boowat.com dan perwakilan klien. Jumlahnya mengikuti rancangan di BAB III.
2. Setiap responden memakai akun sesuai perannya (akun asli, atau akun demo hasil `pnpm prisma db seed`).
3. Responden menjalankan skenario tugas di bagian 2 tanpa dibantu, lalu mengisi kuesioner di bagian 3.
4. Catat untuk setiap tugas: **Berhasil sendiri** / **Berhasil dengan bantuan** / **Gagal**.

## 2. Skenario tugas

**Responden admin**

| Kode | Tugas | Hasil |
|---|---|---|
| A1 | Login, lalu baca ringkasan di halaman Beranda. | |
| A2 | Tambahkan klien baru beserta akun login-nya. | |
| A3 | Buka sebuah proyek, pindahkan satu task ke kolom Selesai, lalu balas pesan klien di tab Pesan. | |
| A4 | Buka kotak masuk Permintaan, tinjau satu permintaan, lalu setujui atau tolak dengan alasan. | |
| A5 | Buat invoice dari sebuah proyek, kirim ke klien, lalu unduh PDF-nya. | |
| A6 | Input statistik pengunjung bulan ini untuk sebuah website. | |

**Responden klien**

| Kode | Tugas | Hasil |
|---|---|---|
| K1 | Login, lalu lihat data website (masa aktif domain/hosting, pengunjung, artikel). | |
| K2 | Buka proyek, cek progresnya, lalu kirim pesan ke tim Boowat. | |
| K3 | Ajukan permintaan perubahan baru dan lihat perkiraan waktu responnya. | |
| K4 | Setujui hasil proyek atau minta revisi pada proyek yang menunggu persetujuan. | |
| K5 | Buka menu Invoice dan unduh PDF invoice. | |
| K6 | Unduh laporan bulanan website. | |

## 3. Kuesioner (skala Likert 1–5)

Keterangan: 1 = Sangat Tidak Setuju, 2 = Tidak Setuju, 3 = Netral, 4 = Setuju, 5 = Sangat Setuju.

| No | Aspek | Pernyataan | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|---|
| 1 | Kemudahan penggunaan | Tampilan sistem mudah dipahami. | | | | | |
| 2 | Kemudahan penggunaan | Menu dan navigasi mudah digunakan untuk menemukan fitur yang dibutuhkan. | | | | | |
| 3 | Kemudahan penggunaan | Saya dapat menyelesaikan tugas tanpa bantuan orang lain. | | | | | |
| 4 | Kemudahan penggunaan | Pesan kesalahan dan petunjuk pada form membantu saya memperbaiki isian. | | | | | |
| 5 | Kesesuaian fitur | Fitur yang tersedia sesuai dengan kebutuhan pekerjaan saya. | | | | | |
| 6 | Kesesuaian fitur | Informasi proyek dan website ditampilkan lengkap dan akurat. | | | | | |
| 7 | Kesesuaian fitur | Fitur permintaan perubahan beserta target waktu respon memudahkan koordinasi. | | | | | |
| 8 | Kesesuaian fitur | Fitur invoice dan laporan (PDF) sesuai dengan kebutuhan. | | | | | |
| 9 | Kepuasan pengguna | Sistem ini lebih efisien dibanding cara sebelumnya (WhatsApp, Trello, Notion). | | | | | |
| 10 | Kepuasan pengguna | Saya puas dengan kecepatan dan kestabilan sistem. | | | | | |
| 11 | Kepuasan pengguna | Saya bersedia menggunakan sistem ini secara rutin. | | | | | |
| 12 | Kepuasan pengguna | Secara keseluruhan saya puas dengan sistem ini. | | | | | |

Saran atau masukan (opsional): ______________________________________________

## 4. Cara menghitung

Notasi: *n* = jumlah responden, *k* = jumlah pernyataan dalam aspek.

- Skor rata-rata per pernyataan = jumlah skor semua responden ÷ *n*.
- Skor rata-rata per aspek = rata-rata dari skor rata-rata pernyataan di aspek tersebut.
- Persentase per aspek = jumlah skor aspek ÷ (*n* × *k* × 5) × 100%.
- Skor keseluruhan = rata-rata dari ke-12 pernyataan. Persentase keseluruhan = jumlah semua skor ÷ (*n* × 12 × 5) × 100%.

## 5. Kategori penilaian (sesuaikan dengan sub-bab 2.4.2)

| Skor rata-rata | Persentase | Kategori |
|---|---|---|
| 1,00 – 1,80 | 20% – 36% | Sangat tidak baik |
| 1,81 – 2,60 | 36,1% – 52% | Tidak baik |
| 2,61 – 3,40 | 52,1% – 68% | Cukup |
| 3,41 – 4,20 | 68,1% – 84% | Baik |
| 4,21 – 5,00 | 84,1% – 100% | Sangat baik |

## 6. Lembar rekap

| Responden | Peran | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 | P12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R1 | | | | | | | | | | | | | |
| R2 | | | | | | | | | | | | | |
| R3 | | | | | | | | | | | | | |
| … | | | | | | | | | | | | | |
| **Rata-rata** | | | | | | | | | | | | | |
