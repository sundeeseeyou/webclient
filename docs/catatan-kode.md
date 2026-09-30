# Catatan Kode

Ringkasan file utama dan alur tiap fitur, sebagai persiapan menjelaskan kode saat sidang.

## Setup: Login dan Hak Akses

**File utama**

| File | Peran |
|---|---|
| `src/app/(auth)/login/page.tsx` | Halaman login. Kalau pengguna sudah login, langsung diarahkan ke portalnya. |
| `src/components/shared/login-form.tsx` | Form login (react-hook-form + Zod) yang memanggil server action `login`. |
| `src/app/(auth)/actions.ts` | Server action `login` dan `logout`. |
| `src/lib/validations/auth.ts` | Skema Zod untuk email dan password, berikut pesan error Bahasa Indonesia. |
| `src/lib/auth.ts` | Konfigurasi Auth.js: provider Credentials, session JWT, callback yang menyimpan `role` dan `clientId`. |
| `src/lib/rbac.ts` | `homePathFor()`, `getSessionUser()`, `requireAdmin()`, `requireClient()`. |
| `src/proxy.ts` | Pemeriksaan awal setiap request halaman berdasarkan cookie session. |
| `src/app/admin/layout.tsx`, `src/app/portal/layout.tsx` | Pemeriksaan ulang role sebelum menampilkan halaman. |

**Alur login**

1. Pengguna mengisi form di `/login`. Zod memvalidasi di browser (email wajib dan formatnya benar, password wajib).
2. Form memanggil server action `login()`, yang memvalidasi ulang dengan skema yang sama.
3. `signIn("credentials")` menjalankan `authorize()` di `lib/auth.ts`:
   - mencari user berdasarkan email (Prisma),
   - membandingkan password dengan `bcrypt.compare`,
   - menolak klien yang perusahaannya nonaktif.
4. Kalau gagal, Auth.js melempar `AuthError`, dan action mengembalikan pesan "Email atau password salah".
5. Kalau berhasil, Auth.js menyimpan cookie session berisi JWT dengan `id`, `role`, dan `clientId`. Action lalu redirect ke `/admin` (ADMIN) atau `/portal` (CLIENT).

**Alur hak akses (dua lapis)**

1. `proxy.ts` membaca session dari cookie pada setiap request halaman:
   - belum login → `/login`
   - klien membuka `/admin/**` → `/portal`
   - admin membuka `/portal/**` → `/admin`
2. Layout `/admin` memanggil `requireAdmin()` dan layout `/portal` memanggil `requireClient()`. Pemeriksaan ini tetap berjalan walaupun proxy terlewati.
3. `requireClient()` mengembalikan `clientId` dari session. Semua query data klien di fase berikutnya wajib memakai `clientId` ini, bukan dari parameter URL.
