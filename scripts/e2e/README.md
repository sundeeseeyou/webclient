# Pengujian end-to-end (black-box)

Skrip di folder ini mengendalikan Google Chrome (mode headless) lewat Chrome DevTools Protocol, tanpa library tambahan. Skrip mengisi form dan mengklik tombol seperti pengguna, memeriksa hasilnya, lalu menyimpan screenshot sebagai bukti.

| File | Isi |
|---|---|
| `blackbox.mjs` | Skenario BB-01 s.d. BB-22 (PRD Bagian 13). Bukti disimpan ke `docs/bab4/blackbox/`. |
| `screenshots.mjs` | Screenshot tampilan hasil implementasi untuk lampiran BAB IV. Hasilnya disimpan ke `docs/bab4/implementasi/`. |
| `browser.mjs` | Pengendali Chrome: buka halaman, isi form, pilih opsi, screenshot, unduhan. |
| `api.mjs` | Klien HTTP dengan cookie session untuk menyiapkan dan memeriksa data lewat API. |

## Menjalankan

```bash
pnpm prisma db seed          # data awal harus bersih; setiap skenario mengubah data
pnpm build && pnpm start     # di terminal lain, server di http://localhost:3000
node scripts/e2e/blackbox.mjs
node scripts/e2e/screenshots.mjs   # jalankan setelah seed ulang agar tampilan memakai data awal
```

Variabel opsional:

| Variabel | Bawaan |
|---|---|
| `BASE_URL` | `http://localhost:3000` |
| `CHROME_PATH` | `C:/Program Files/Google/Chrome/Application/chrome.exe` |
| `CRON_SECRET` | dibaca dari `.env` |

File unduhan (PDF invoice dan laporan) disimpan di `docs/bab4/blackbox/unduhan/`, bukan di folder Downloads pengguna.
