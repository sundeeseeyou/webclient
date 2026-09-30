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

## Helper bersama (fondasi Fase 1)

| File | Peran |
|---|---|
| `src/lib/api.ts` | Format respons `{ data, error }`: `ok()`, `fail()`, `notFound()`, `parseBody()` (validasi Zod → field error), `isUniqueViolation()`. |
| `src/lib/rbac.ts` | `requireApiUser(role?)` untuk route handler (401 belum login, 403 role salah) dan `clientScope(user)` untuk filter `clientId` klien. |
| `src/lib/api-client.ts` | `apiRequest()` untuk memanggil API dari form, `setFieldErrors()` untuk menampilkan error per kolom. |
| `src/lib/validations/common.ts` | Potongan skema Zod yang dipakai semua form, dengan pesan Bahasa Indonesia. |
| `src/lib/notify.ts` | Membuat notifikasi (dengan `dedupeKey` anti-dobel) dan mengirim email opsional lewat Resend. |
| `src/lib/progress.ts` | Progres proyek = task DONE / semua task × 100. |
| `src/app/api/notifications/**`, `src/components/shared/notification-bell.tsx` | Lonceng: daftar notifikasi, tandai dibaca, diperbarui tiap 30 detik. |

Pola setiap fitur: **halaman** (server component, membaca Prisma) → **komponen form** (react-hook-form + skema Zod) → `apiRequest` → **route handler** (`requireApiUser` → `parseBody` dengan skema yang sama → Prisma) → `router.refresh()` + toast.

## PB-01: Kelola Klien

**File utama**

| File | Peran |
|---|---|
| `src/app/admin/clients/page.tsx`, `src/components/admin/clients/clients-table.tsx`, `client-search.tsx` | Daftar klien dengan pencarian `?q=`. |
| `src/app/admin/clients/new/page.tsx`, `new-client-form.tsx`, `client-profile-fields.tsx` | Form tambah klien dan akun login opsional. |
| `src/app/admin/clients/[id]/page.tsx`, `client-profile-card.tsx`, `client-tabs.tsx` | Detail klien: profil, ubah, nonaktifkan, tab Website / Proyek / Akun Login. |
| `src/lib/clients.ts` | Query bersama `listClients()`, `getClientDetail()`, `isEmailTaken()`. |
| `src/lib/validations/client.ts` | Skema profil klien, akun login, dan form tambah klien. |
| `src/app/api/clients/**` | Route handler daftar/tambah, detail/ubah/nonaktifkan, dan tambah akun. |

**Alur tambah klien (BB-05, BB-06)**
1. Admin mengisi form. `newClientFormSchema` memvalidasi di browser; bagian akun hanya divalidasi bila checkbox "Buatkan akun login" dicentang.
2. `POST /api/clients` → `requireApiUser("ADMIN")` → `parseBody(createClientSchema)` (email diubah ke huruf kecil).
3. `isEmailTaken()` mengecek email login. Kalau sudah dipakai → 409, dan pesan "Email sudah dipakai akun lain" muncul di kolom Email login.
4. Password di-hash dengan bcrypt, lalu `prisma.$transaction` membuat `Client` dan `User` (role CLIENT, `clientId` terisi).
5. Berhasil → toast lalu pindah ke detail klien.

**Alur nonaktifkan klien**
1. Tombol "Nonaktifkan" → ConfirmDialog → `DELETE /api/clients/[id]` → `isActive=false`.
2. `authorize()` di `lib/auth.ts` menolak login baru. Callback `jwt` memeriksa `Client.isActive` di setiap request, sehingga sesi yang sedang berjalan langsung berakhir.

## PB-04: Data Website

**File utama**

| File | Peran |
|---|---|
| `src/app/admin/websites/new/page.tsx`, `src/components/admin/websites/website-form.tsx` | Form tambah website. |
| `src/app/admin/websites/[id]/page.tsx`, `src/components/admin/websites/*` | Detail website admin: domain & hosting, grafik, input statistik, riwayat, artikel, sinkron WordPress. |
| `src/app/portal/page.tsx`, `src/components/portal/website-summary-card.tsx` | Dashboard klien per website. |
| `src/app/portal/websites/[id]/page.tsx` | Detail website di portal klien. |
| `src/components/shared/visitor-chart.tsx` | Grafik pengunjung 6 bulan (Recharts), dipakai admin & klien. |
| `src/lib/validations/website.ts` | Skema website, statistik bulanan, artikel. |
| `src/lib/website-stats.ts`, `src/lib/renewal.ts` | Deret 6 bulan dan perbandingan bulan lalu; warna & teks masa aktif. |
| `src/app/api/websites/**`, `src/app/api/articles/[id]/route.ts` | CRUD website, statistik (PUT upsert), artikel, sinkron WordPress. |
| `src/lib/integrations/wordpress.ts`, `src/lib/integrations/ga4.ts` | Adapter opsional WordPress dan Google Analytics. |
| `src/app/api/cron/daily/route.ts`, `src/lib/renewal-reminders.ts`, `vercel.json` | Cron harian: pengingat perpanjangan dan sinkron GA4. |

**Alur statistik bulanan (BB-07)**
1. Admin memilih bulan, dan angka lama bulan itu terisi otomatis.
2. `PUT /api/websites/[id]/stats` → `websiteStatSchema` → `parseMonthInput` (tanggal 1, 00:00 WIB) → `websiteStat.upsert` per (website, bulan).
3. Dashboard klien membaca 6 bulan terakhir dan membandingkan "bulan ini" (WIB) dengan bulan lalu.

**Alur artikel dan WordPress**
1. Tambah/ubah lewat dialog → `POST /api/websites/[id]/articles` atau `PATCH /api/articles/[id]`.
2. Tombol "Sinkron dari WordPress" hanya muncul bila alamat WordPress API terisi. Adapter mengambil `/wp/v2/posts`, lalu upsert berdasarkan id post WordPress.

**Alur cron dan pengingat perpanjangan (BB-08)**
1. Vercel Cron memanggil `GET /api/cron/daily` pukul 08:00 WIB dengan `Authorization: Bearer CRON_SECRET`; tanpa token yang cocok → 401.
2. Untuk tiap website klien aktif dihitung sisa hari domain & hosting. Tahap 30 hari atau 7 hari → notifikasi ke admin dan user klien, dengan `dedupeKey` sehingga aman dijalankan berulang.
3. Bila kredensial GA4 ada, pengunjung bulan berjalan disinkronkan.
4. Kartu website klien berwarna kuning bila ≤30 hari dan merah bila ≤7 hari (`renewal.ts`).

**Hak akses (BB-04):** halaman dan API klien selalu memfilter `clientId` dari session; website klien lain → 404. Ubah, hapus, statistik, dan artikel hanya untuk ADMIN (403 untuk klien).

## Proyek, Sprint & Task (PB-01) dan Pesan Proyek (PB-02)

**File utama**

| File | Peran |
|---|---|
| `src/lib/validations/project.ts` | Skema Zod proyek, sprint, task, dan pesan, dengan aturan tanggal selesai ≥ tanggal mulai. |
| `src/lib/projects.ts` | `listProjects()`: daftar proyek beserta progres, dipakai admin, portal, dan API. |
| `src/lib/messages.ts` | Mengambil dan membuat pesan thread, serta cuplikan untuk notifikasi. |
| `src/app/api/projects/**`, `src/app/api/sprints/**`, `src/app/api/tasks/[id]/route.ts` | Route handler proyek, sprint, task, dan pesan. |
| `src/app/admin/projects/**` | Daftar dengan filter, form tambah, detail dengan tab Ringkasan / Sprint & Task / Pesan. |
| `src/components/admin/kanban-board.tsx`, `kanban-column.tsx`, `task-card.tsx` | Papan kanban: tombol panah, drag & drop HTML5, pembaruan optimistis. |
| `src/components/shared/message-thread.tsx` | Thread pesan untuk admin & portal, polling 15 detik. |
| `src/app/portal/projects/**`, `src/components/portal/project-text.ts` | Daftar & detail proyek klien dengan bahasa sederhana. |

**Alur tambah proyek**
1. `/admin/projects/new` memuat klien aktif dan websitenya, lalu `ProjectForm` (react-hook-form + `projectSchema`) memvalidasi di browser.
2. `POST /api/projects` → `requireApiUser("ADMIN")` → validasi ulang dengan skema yang sama → cek klien aktif dan kepemilikan website → `prisma.project.create`.
3. Berhasil → toast lalu pindah ke detail proyek.

**Alur ubah status**
1. Select di tab Ringkasan → `PATCH /api/projects/[id]`.
2. Bila status baru Menunggu Persetujuan, `notifyClientUsers()` membuat notifikasi dengan tautan ke `/portal/projects/<id>`.

**Alur kanban dan progres (BB-09)**
1. Kartu dipindah (panah atau drag), dan tampilan langsung berubah (optimistis).
2. `PATCH /api/tasks/[id]` dengan `{ status, order }`; server menyisipkan task dan menomori ulang kolom dalam satu transaksi.
3. `router.refresh()` menghitung ulang progres lewat `projectProgress()`; portal klien membaca angka yang sama.
4. Bila API gagal, kartu kembali ke posisi semula dan muncul toast.

**Alur pesan (BB-10)**
1. Textarea divalidasi `messageSchema` (wajib, maksimal 2000 karakter).
2. `POST /api/projects/[id]/messages` → proyek dicari dengan filter `clientScope(user)` (proyek klien lain → 404) → `prisma.message.create`.
3. Notifikasi ke pihak lain: klien → semua admin (tautan `?tab=pesan`), admin → user klien.
4. Pihak lain melihat pesan baru lewat polling setiap 15 detik saat tab aktif.

**Hak akses (BB-04):** halaman portal memakai `requireClient()` dan query `{ id, clientId }`, sehingga proyek klien lain → HTTP 404. Mutasi proyek, sprint, dan task hanya untuk admin (403 untuk klien).

## PB-03: Invoice

**File utama**

| File | Peran |
|---|---|
| `src/lib/invoice.ts` | Aturan bisnis: nomor `INV/YYYY/MM/NNNN`, total dari item, jatuh tempo, status efektif, aksi kirim/lunas/batal. |
| `src/lib/validations/invoice.ts` | Skema Zod invoice dan item (dipakai form dan API). |
| `src/lib/invoice-queries.ts`, `src/lib/invoice-writes.ts` | Aturan akses dan daftar dengan filter; transaksi pembuatan nomor serta aksi status + notifikasi. |
| `src/app/api/invoices/**` | Daftar/buat, detail/ubah draf, send, mark-paid, cancel, pdf. |
| `src/lib/pdf/invoice-pdf.tsx` | Dokumen PDF invoice. |
| `src/lib/invoice-overdue.ts`, `src/app/api/cron/daily/route.ts` | Cron: SENT yang lewat jatuh tempo menjadi OVERDUE. |
| `src/app/admin/invoices/**`, `src/components/admin/invoices/*` | Daftar dengan filter, form item dinamis, detail + aksi, tab Invoice di proyek dan klien. |
| `src/app/portal/invoices/page.tsx`, `src/components/portal/invoice-list.tsx` | Daftar invoice klien + unduh PDF. |

**Alur generate invoice (BB-18)**
1. Tab Invoice di proyek → "Buat Invoice" → `/admin/invoices/new?projectId=`. Klien dan proyek terisi otomatis; tanggal terbit hari ini, jatuh tempo +14 hari.
2. Form (react-hook-form + `useFieldArray`) memvalidasi per kolom; total di browser hanya untuk tampilan.
3. `POST /api/invoices` → `requireApiUser("ADMIN")` → validasi ulang → cek proyek milik klien aktif → dalam satu transaksi `generateInvoiceNumber` + `invoice.create` dengan `amount = calculateInvoiceTotal(items)` dan status DRAFT.

**Alur status (BB-19, BB-20)**
1. Tombol di detail → ConfirmDialog → `POST /api/invoices/[id]/send|mark-paid|cancel`.
2. `canApplyInvoiceAction(effectiveInvoiceStatus(invoice), aksi)`; aksi yang tidak sesuai status → 400.
3. Kirim → `notifyClientUsers` ("Invoice baru"). Tandai lunas → `paidAt` terisi.
4. Klien mengunduh PDF lewat `GET /api/invoices/[id]/pdf`, dengan aturan akses yang sama seperti detail.

**Hak akses (BB-21, BB-04):** klien hanya melihat invoice proyek miliknya yang berstatus Terkirim, Lunas, atau Terlambat. Draf, invoice batal, dan milik klien lain → 404, termasuk PDF-nya.

## PB-05: Permintaan (SLA) dan Persetujuan Proyek

**File utama**

| File | Peran |
|---|---|
| `src/lib/sla.ts` | Target SLA per prioritas, `computeDueAt`, alur status `canTransition`, `isOverdue`. |
| `src/lib/validations/request.ts` | Skema form permintaan, form revisi, dan ubah status (alasan penolakan wajib). |
| `src/lib/requests.ts` | `listRequests()` (urutan kotak masuk) dan parser filter URL. |
| `src/app/api/requests/**` | Ajukan, daftar dengan filter, detail, ubah status. |
| `src/app/api/projects/[id]/approve`, `request-revision` | Setujui hasil dan minta revisi. |
| `src/app/admin/requests/**`, `src/components/admin/requests/*` | Kotak masuk, detail, panel aksi, dialog tolak. |
| `src/app/portal/requests/**`, `src/components/portal/request-*.tsx` | Daftar dan form Ajukan Permintaan. |
| `src/components/portal/project-approval.tsx`, `revision-dialog.tsx` | Kartu Setujui Hasil / Minta Revisi di detail proyek klien. |

**Alur ajukan permintaan (BB-11, BB-12)**
1. Form di `/portal/requests/new` memvalidasi dengan `requestSchema`; setelah prioritas dipilih tampil "Perkiraan waktu respon: …".
2. `POST /api/requests` → `requireApiUser("CLIENT")` → website/proyek dicek milik klien → `slaRequest.create` dengan `dueAt = computeDueAt(now, prioritas)` dan status Diajukan.
3. `notifyAdmins` "Permintaan baru" dengan tautan ke detail di kotak masuk admin.

**Alur ubah status (BB-13, BB-14, BB-15)**
1. Kotak masuk menampilkan badge "Melewati SLA" untuk permintaan yang `isOverdue` dan menaruhnya paling atas.
2. Panel aksi di detail hanya menampilkan transisi dari `allowedTransitions`. "Tolak" membuka dialog dengan alasan wajib.
3. `PATCH /api/requests/[id]/status` → validasi (REJECTED tanpa alasan → 400) → `canTransition` (di luar alur → 400) → simpan dengan syarat status lama. `respondedAt` diisi sekali, `resolvedAt` saat Selesai/Ditolak.
4. `notifyClientUsers` "Status permintaan diperbarui"; klien melihat status, tanggapan, dan alasan penolakan.

**Alur persetujuan proyek (BB-16, BB-17)**
1. Admin mengubah proyek ke Menunggu Persetujuan, lalu klien mendapat notifikasi.
2. "Setujui Hasil" → `POST /api/projects/[id]/approve` → status Selesai + `approvedAt` → notifikasi admin.
3. "Minta Revisi" → dialog form → `POST /api/projects/[id]/request-revision` → dalam satu transaksi permintaan revisi dibuat dan status proyek menjadi Revisi → notifikasi admin.

## Dashboard Admin dan Laporan Bulanan (PB-04)

**File utama**

| File | Peran |
|---|---|
| `src/app/admin/(dashboard)/page.tsx`, `src/lib/admin-dashboard.ts` | Beranda admin; semua query ringkasan dalam satu `Promise.all`. |
| `src/components/admin/dashboard/*` | Kartu ringkasan, permintaan terbaru, perpanjangan terdekat. |
| `src/app/api/reports/monthly/route.ts`, `src/lib/validations/report.ts` | `GET ?websiteId=&month=YYYY-MM` dan validasi bulan (tidak boleh masa depan). |
| `src/lib/monthly-report.ts`, `src/lib/pdf/monthly-report-pdf.tsx`, `report-parts.tsx` | Query isi laporan dan dokumen PDF. |
| `src/app/portal/reports/page.tsx`, `src/components/shared/monthly-report-form.tsx` | Halaman Laporan klien; form yang sama dipakai dialog di detail website admin. |

**Alur dashboard:** `requireAdmin()` → `getAdminDashboard(now)` menghitung klien aktif, proyek berjalan, permintaan baru, permintaan melewati SLA (`overdueWhere`), invoice belum lunas + total, dan domain/hosting yang akan habis. Setiap kartu menaut ke daftar dengan filter, misalnya `/admin/requests?overdue=1` atau `/admin/invoices?status=unpaid`.

**Alur laporan bulanan (BB-22)**
1. Klien memilih website dan bulan; "Unduh Laporan Bulanan" memanggil API lewat `fetch`.
2. Route: `requireApiUser()` → validasi parameter → `getMonthlyReport()` dengan filter `clientScope(user)` (website klien lain → 404).
3. Batas bulan dihitung dalam WIB. Query mengambil statistik bulan itu dan bulan lalu, artikel terbit, permintaan selesai, proyek aktif + progres, serta tanggal perpanjangan.
4. `pdfResponse(createElement(MonthlyReportDocument, …))` → browser mengunduh `Laporan-{domain}-{YYYY-MM}.pdf`.
