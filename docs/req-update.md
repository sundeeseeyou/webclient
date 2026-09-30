## 0. Update permintaan revisi / tambahan

1. Baca seluruh dokumen ini sebelum menulis kode.
2. Kerjakan **per fase** (lihat Bagian 11). Jangan loncat fase.
3. Di akhir setiap fase, wajib lolos:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
   - `npx prisma migrate dev` + `npx prisma db seed` berjalan tanpa error
4. Commit kecil per fitur, bukan satu commit besar per fase. Format pesan: `PB-0X: <apa yang berubah>` (contoh: `PB-05: validasi alasan penolakan permintaan`). Untuk setup pakai `setup: ...`. Riwayat commit ini nanti jadi bukti pengerjaan per sprint di BAB IV.
5. Wajib ikuti Bagian 15 (Standar Kualitas UI dan Kode). Cek ulang daftar di Bagian 15.4 di akhir setiap fase.
6. Jangan menambah library di luar Bagian 3 kecuali benar-benar perlu. Kalau menambah, tulis alasannya di `DECISIONS.md`.
7. Kalau ada hal yang tidak jelas di PRD, ambil keputusan paling sederhana, lalu catat di `DECISIONS.md`.
8. Semua teks yang dilihat pengguna memakai Bahasa Indonesia yang mudah dipahami orang non-teknis. Hindari istilah teknis di portal klien (contoh: pakai "Permintaan" bukan "Ticket", "Pengunjung" bukan "Sessions").

## Desain

1. Gunakan desain terutama layour terinspirasi dari tailadmin https://demo.tailadmin.com/
2. Gunakan border dengan shadow-xs / minimal, dan gunakan radius yang tidak terlalu kecil dan tidak terlalu membulat
3. Gunakan Heading Gabarino dan bodytext Google Jakarta
4. Pastikan gunakan icon dari react-icons/pi (phosphor icons)
5. Login page, gunakan side by side mode.

## UI UX

1. Selalu terapkan UI UX dengan benar
2. Gunakan modal yang bagus dan smooth transition
3. Gunakan validasi sederhana terlebih dahulu karena mvp, tapi yang jelas terdapat sistem validasi terutama form dll
