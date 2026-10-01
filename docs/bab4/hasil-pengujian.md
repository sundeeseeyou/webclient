# BAB IV — Hasil dan Pembahasan (draf)

> Bagian bertanda **[…]** baru boleh diisi setelah UAT dilakukan dengan responden sungguhan. Lihat "Catatan untuk penulis" di bagian akhir.

## 4.1 Hasil Implementasi Sistem

Berdasarkan perancangan sistem pada sub-bab 3.3, sistem manajemen proyek dan klien untuk Web Agency Boowat.com berhasil diimplementasikan dalam dua portal utama, yaitu portal admin dan portal klien. Portal admin menyediakan fitur pengelolaan data klien, komunikasi proyek, pembuatan invoice, dan penanganan permintaan perubahan. Portal klien menyediakan fitur untuk melihat data website, riwayat komunikasi, invoice, dan pengajuan permintaan perubahan. Tampilan hasil implementasi kedua portal dapat dilihat pada lampiran Gambar 4.1 hingga Gambar 4.8.

| Gambar | Keterangan | File |
|---|---|---|
| Gambar 4.1 | Portal admin — pengelolaan data klien | `implementasi/gambar-4-1-admin-kelola-klien.jpg` |
| Gambar 4.2 | Portal admin — komunikasi proyek | `implementasi/gambar-4-2-admin-komunikasi-proyek.jpg` |
| Gambar 4.3 | Portal admin — invoice | `implementasi/gambar-4-3-admin-invoice.jpg` |
| Gambar 4.4 | Portal admin — penanganan permintaan perubahan | `implementasi/gambar-4-4-admin-permintaan.jpg` |
| Gambar 4.5 | Portal klien — data website | `implementasi/gambar-4-5-klien-data-website.jpg` |
| Gambar 4.6 | Portal klien — riwayat komunikasi proyek | `implementasi/gambar-4-6-klien-komunikasi-proyek.jpg` |
| Gambar 4.7 | Portal klien — invoice | `implementasi/gambar-4-7-klien-invoice.jpg` |
| Gambar 4.8 | Portal klien — pengajuan permintaan perubahan | `implementasi/gambar-4-8-klien-ajukan-permintaan.jpg` |

Gambar tambahan bila diperlukan: halaman login (`tambahan-halaman-login.jpg`), beranda admin (`tambahan-beranda-admin.jpg`), dan papan kanban sprint (`tambahan-kanban-sprint.jpg`).

## 4.2 Hasil Pengujian

Pengujian sistem dilakukan melalui dua metode, yaitu Black-Box Testing dan User Acceptance Testing (UAT), sebagaimana telah dijelaskan pada sub-bab 2.1.7.

Black-Box Testing dilakukan terhadap seluruh fitur sistem berdasarkan lima item Product Backlog (PB-01 hingga PB-05) yang telah diimplementasikan pada tahap pengembangan (sub-bab 3.4), ditambah skenario autentikasi dan hak akses sebagai fitur pendukung. Pengujian berjalan di browser terhadap build produksi aplikasi dengan data uji awal yang sama untuk setiap skenario. Hasil pengujian ditunjukkan pada Tabel 4.1.

**Tabel 4.1 Hasil Black-Box Testing**

| No | Product Backlog | Fitur | Skenario Pengujian | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
|---|---|---|---|---|---|---|
| 1 | Pendukung | Login | Admin login dengan email dan password yang benar | Masuk ke halaman beranda admin | Admin diarahkan ke halaman Beranda admin (`/admin`) | Berhasil |
| 2 | Pendukung | Login | Login dengan password yang salah | Muncul pesan "Email atau password salah" dan tetap di halaman login | Pesan "Email atau password salah" tampil, pengguna tetap di halaman login | Berhasil |
| 3 | Pendukung | Hak akses | Klien membuka halaman admin (`/admin`) | Diarahkan ke portal klien atau halaman login | Klien diarahkan ke portal klien (`/portal`) | Berhasil |
| 4 | Pendukung | Hak akses | Klien A membuka URL proyek milik klien B | Halaman 404 | Tampil halaman "Halaman tidak ditemukan" dengan status HTTP 404 | Berhasil |
| 5 | PB-01 | Kelola klien | Admin menambah klien dengan data lengkap beserta akun login | Klien muncul di daftar dan akun login dapat dipakai | Klien "Toko Roti Harum Manis" tampil di daftar klien; akun barunya berhasil login ke portal klien | Berhasil |
| 6 | PB-01 | Kelola klien | Admin menambah klien dengan email login yang sudah dipakai akun lain | Muncul pesan validasi dan data tidak tersimpan | Pesan "Email sudah dipakai akun lain" tampil; jumlah klien tidak bertambah | Berhasil |
| 7 | PB-01 | Proyek | Admin memindahkan task ke status Selesai (DONE) | Progres proyek bertambah di portal admin dan portal klien | Progres naik dari 56% menjadi 67%, dan portal klien menampilkan 67% | Berhasil |
| 8 | PB-02 | Pesan | Klien mengirim pesan di thread proyek | Pesan tampil di thread admin dan admin mendapat notifikasi | Admin menerima notifikasi "Pesan baru dari Klinik Gigi Senyum Sehat" yang membuka tab Pesan, dan pesan klien tampil di thread | Berhasil |
| 9 | PB-02 | Permintaan | Admin menolak permintaan tanpa mengisi alasan | Sistem menolak; alasan wajib diisi | Muncul pesan "Alasan penolakan wajib diisi"; status tetap "Sedang Ditinjau" | Berhasil |
| 10 | PB-02 | Permintaan | Admin menolak permintaan dengan alasan | Klien melihat status "Ditolak" beserta alasannya | Klien melihat status "Ditolak" dengan alasan "Promo ini belum termasuk paket konten bulan ini." | Berhasil |
| 11 | PB-02 | Permintaan (SLA) | Permintaan belum direspons melewati batas waktu | Badge "Melewati SLA" tampil di portal admin | Permintaan "Tombol checkout tidak bisa diklik di HP" tampil di urutan teratas dengan badge merah "Melewati SLA" | Berhasil |
| 12 | PB-03 | Invoice | Admin membuat (generate) invoice dari proyek | Nomor invoice otomatis; data klien dan proyek terisi | Nomor otomatis INV/2026/10/0002; klien Batik Laras Solo dan proyek terisi otomatis; total Rp 1.500.000 berstatus Draf | Berhasil |
| 13 | PB-03 | Invoice | Admin mengirim invoice | Klien melihat invoice dan mendapat notifikasi | Invoice INV/2026/10/0002 tampil di portal klien; klien menerima notifikasi "Invoice baru" | Berhasil |
| 14 | PB-03 | Invoice | Klien mengunduh invoice | File PDF terunduh dengan data yang benar | File "Invoice INV-2026-10-0002.pdf" terunduh dengan nomor, data klien, item, dan total yang benar | Berhasil |
| 15 | PB-03 | Invoice | Invoice berstatus Draf | Tidak terlihat di portal klien | Invoice draf INV/2026/10/0001 tidak tampil di portal klien; akses langsung ke datanya ditolak (HTTP 404) | Berhasil |
| 16 | PB-04 | Data website | Admin menginput statistik pengunjung bulan berjalan | Angka pengunjung di dashboard klien berubah | Dashboard klien menampilkan "Pengunjung bulan ini" 2.500 sesuai input admin | Berhasil |
| 17 | PB-04 | Data website | Masa aktif domain tinggal ≤ 7 hari | Kartu website klien berwarna merah dan muncul notifikasi pengingat | Kartu website berwarna merah dengan keterangan "Habis dalam 5 hari"; klien menerima notifikasi "Domain segera habis" | Berhasil |
| 18 | PB-04 | Laporan | Klien mengunduh laporan bulanan | PDF berisi statistik, artikel, dan permintaan bulan tersebut | File "Laporan-kopinusantara.co.id-2026-09.pdf" terunduh berisi statistik pengunjung, artikel terbit, dan permintaan yang diselesaikan | Berhasil |
| 19 | PB-05 | Permintaan | Klien mengirim form permintaan tanpa judul | Muncul pesan validasi; permintaan tidak terkirim | Muncul pesan "Judul permintaan wajib diisi"; permintaan tidak terkirim | Berhasil |
| 20 | PB-05 | Permintaan | Klien mengirim permintaan berprioritas Tinggi | Status "Diajukan", batas respon +1 hari, dan admin mendapat notifikasi | Status "Diajukan"; perkiraan waktu respon 1 hari (batas respon +24 jam); admin menerima notifikasi "Permintaan baru" | Berhasil |
| 21 | PB-05 | Persetujuan proyek | Klien klik "Setujui Hasil" pada proyek yang menunggu persetujuan | Status proyek "Selesai" dan tanggal persetujuan tercatat | Status proyek menjadi "Selesai" dengan keterangan "Disetujui pada 1 Okt 2026" | Berhasil |
| 22 | PB-05 | Persetujuan proyek | Klien klik "Minta Revisi" | Permintaan revisi baru terbuat dan status proyek menjadi "Revisi" | Permintaan revisi "Warna tombol checkout diganti" (Revisi Desain) terbuat; status proyek menjadi "Revisi" | Berhasil |

Berdasarkan Tabel 4.1, seluruh 22 skenario pengujian memberikan hasil sesuai yang diharapkan (22 dari 22 skenario berhasil, 100%). Dengan demikian, seluruh fitur pada Product Backlog PB-01 hingga PB-05 beserta fitur autentikasi dan hak akses telah berfungsi sesuai kebutuhan.

**User Acceptance Testing (UAT)**

Selanjutnya, User Acceptance Testing (UAT) dilakukan untuk mengukur tingkat penerimaan pengguna terhadap sistem, sesuai dengan indikator yang telah didefinisikan pada sub-bab 2.4.2. Pengujian melibatkan [jumlah] responden yang terdiri dari [jumlah] admin dan [jumlah] klien Boowat.com. Setiap responden menjalankan skenario tugas sesuai perannya, lalu mengisi kuesioner skala Likert 1 sampai 5 yang mencakup aspek kemudahan penggunaan, kesesuaian fitur, dan kepuasan pengguna. Hasil pengujian menunjukkan skor rata-rata sebesar [skor] dari 5 ([persentase]%), yang mengindikasikan bahwa sistem [kategori penilaian, misalnya "diterima dengan baik oleh pengguna"]. Rekapitulasi skor per aspek ditunjukkan pada Tabel 4.2.

**Tabel 4.2 Rekapitulasi Hasil UAT**

| Aspek | Jumlah pernyataan | Skor rata-rata (1–5) | Persentase | Kategori |
|---|---|---|---|---|
| Kemudahan penggunaan | 4 | [ ] | [ ] | [ ] |
| Kesesuaian fitur | 4 | [ ] | [ ] | [ ] |
| Kepuasan pengguna | 4 | [ ] | [ ] | [ ] |
| **Keseluruhan** | **12** | **[ ]** | **[ ]** | **[ ]** |

## 4.3 Hasil Analisis

Sebelum adanya sistem ini, Boowat.com menggunakan Trello, WhatsApp, dan Notion secara terpisah sehingga informasi proyek tersebar dan sulit dipantau. Setelah sistem diimplementasikan, data klien, website, proyek, komunikasi, permintaan perubahan, dan invoice terintegrasi dalam satu platform yang dapat diakses oleh admin maupun klien.

Dibandingkan aplikasi manajemen proyek umum (Trello, Asana, Monday.com), sistem ini berbeda karena menyediakan portal klien, pembuatan invoice, dan permintaan perubahan dengan target waktu respon (SLA) dalam satu platform. Fitur tersebut tidak tersedia pada aplikasi generik, sehingga sistem ini lebih sesuai dengan alur kerja web agency.

Berdasarkan hasil Black-Box Testing, seluruh fitur berfungsi sesuai skenario yang dirancang. Berdasarkan hasil UAT, sistem [telah/belum] memenuhi indikator keberhasilan pada sub-bab 2.4.2 dan [sesuai/belum sesuai] dengan kebutuhan pengguna sebagaimana dirumuskan pada Bab I.

---

## Catatan untuk penulis (bukan bagian dari BAB IV)

1. **Cara Black-Box Testing dijalankan.**
   - Ke-22 skenario dijalankan otomatis lewat browser Chrome (mode headless, 1440×900) oleh skrip `scripts/e2e/blackbox.mjs`. Skrip mengisi form dan mengklik tombol seperti pengguna, lalu memeriksa hasilnya.
   - Waktu pengujian: 1 Oktober 2026, terhadap build produksi commit `ad7d595`, dengan data awal dari `pnpm prisma db seed`.
   - Bukti per skenario ada di `docs/bab4/blackbox/BB-01.jpg` s.d. `BB-22.jpg`, hasil mentah di `hasil.json`, dan PDF hasil unduhan di `blackbox/unduhan/`. Nomor BB di file bukti mengikuti PRD Bagian 13, sedangkan nomor baris Tabel 4.1 diurutkan per Product Backlog.
   - Sebutkan cara ini apa adanya di skripsi (misalnya "pengujian dijalankan dengan skenario terotomasi berbasis browser"). Bila dosen meminta pengujian manual, ulangi memakai `docs/blackbox-checklist.md`.
2. **UAT belum dilakukan dan tidak boleh diisi dengan angka karangan.** UAT mengukur penerimaan pengguna sungguhan. Jalankan dengan admin dan klien Boowat.com memakai perangkat di `docs/bab4/uat-kuesioner.md`, lalu isi semua bagian bertanda [ ] dan Tabel 4.2 dari hasil kuesioner.
3. **Sesuaikan dengan BAB II.** Pastikan aspek, jumlah pernyataan, dan kategori penilaian UAT sama dengan yang tertulis di sub-bab 2.1.7 dan 2.4.2. Bila berbeda, ikuti BAB II dan ubah kuesionernya.
4. **Kalimat terakhir 4.3** baru boleh ditulis "telah memenuhi" bila skor UAT benar-benar mencapai indikator keberhasilan di 2.4.2.
