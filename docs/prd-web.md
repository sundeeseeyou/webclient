# PRD — Sistem Manajemen Proyek dan Klien untuk Web Agency (MVP)

> Dokumen ini ditujukan untuk Claude Code sebagai acuan membangun MVP.
> Studi kasus: Boowat.com (web agency). Metode pengembangan: Agile Scrum (2 sprint).
> Bahasa UI: **Bahasa Indonesia**. Zona waktu: **Asia/Jakarta**. Mata uang: **IDR**.

---

## 0. Cara Kerja untuk Claude Code

1. Baca seluruh dokumen ini sebelum menulis kode.
2. Kerjakan **per fase** (lihat Bagian 11). Jangan loncat fase.
3. Di akhir setiap fase, wajib lolos:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
   - `npx prisma migrate dev` + `npx prisma db seed` berjalan tanpa error
4. Commit kecil per fitur, bukan satu commit besar per fase. Format pesan: `PB-0X: <apa yang berubah>` (contoh: `PB-05: validasi alasan penolakan permintaan`). Untuk setup pakai `setup: ...`. Riwayat commit ini nanti jadi bukti pengerjaan per sprint di BAB IV.
8. Wajib ikuti Bagian 15 (Standar Kualitas UI dan Kode). Cek ulang daftar di Bagian 15.4 di akhir setiap fase.
5. Jangan menambah library di luar Bagian 3 kecuali benar-benar perlu. Kalau menambah, tulis alasannya di `DECISIONS.md`.
6. Kalau ada hal yang tidak jelas di PRD, ambil keputusan paling sederhana, lalu catat di `DECISIONS.md`.
7. Semua teks yang dilihat pengguna memakai Bahasa Indonesia yang mudah dipahami orang non-teknis. Hindari istilah teknis di portal klien (contoh: pakai "Permintaan" bukan "Ticket", "Pengunjung" bukan "Sessions").

---

## 1. Latar Belakang Singkat

Web agency (Boowat.com) selama ini mengelola proyek dan komunikasi klien lewat banyak aplikasi terpisah (WhatsApp, Notion, Trello). Akibatnya:

- Informasi proyek tersebar dan sulit dipantau.
- Klien non-teknis tidak punya satu tempat untuk melihat progres proyek, data website, invoice, dan mengajukan perubahan.
- Admin kesulitan mengelola banyak klien sekaligus.

MVP ini menyatukan semuanya dalam satu web app dengan dua portal:

| Portal | Pengguna | Fungsi utama |
|---|---|---|
| **Portal Admin** (`/admin`) | Tim web agency | Kelola klien, website, proyek, sprint & task, invoice, dan permintaan (SLA) dari klien |
| **Portal Klien** (`/portal`) | Pemilik website (non-teknis) | Pantau website & proyek, ajukan permintaan perubahan, setujui hasil kerja, unduh invoice & laporan |

---

## 2. Tujuan dan Batasan MVP

### 2.1 Tujuan (harus tercapai)
1. Klien bisa melihat ringkasan website miliknya: domain, masa aktif domain & hosting, total pengunjung, jumlah artikel, dan status proyek yang sedang berjalan.
2. Klien bisa mengajukan permintaan (tambah konten, edit konten/post, revisi desain, dll) dan memantau statusnya.
3. Klien bisa menyetujui hasil kerja atau meminta revisi.
4. Klien bisa melihat dan mengunduh invoice.
5. Admin bisa mengelola lebih dari satu klien beserta website-websitenya.
6. Admin bisa menerima, meninjau, menyetujui/menolak, dan menyelesaikan permintaan klien dengan target waktu respon (SLA).
7. Admin bisa mengelola proyek dengan sprint dan task (papan kanban sederhana).
8. Admin dan klien bisa berdiskusi per proyek dalam satu thread pesan.

### 2.2 Di luar cakupan MVP (jangan dibuat)
- Payment gateway / pembayaran online (status lunas diubah manual oleh admin).
- Pendaftaran akun mandiri oleh klien (akun klien dibuat oleh admin).
- Chat realtime dengan WebSocket (cukup refresh/polling).
- Multi-role admin yang rumit (cukup satu role ADMIN).
- Upload file besar (cukup kolom tautan/URL referensi, misal link Google Drive).
- Aplikasi mobile native, multi-bahasa.

---

## 3. Tech Stack (sesuai dokumen skripsi)

| Bagian | Pilihan |
|---|---|
| Framework | Next.js (App Router, versi stabil terbaru) + TypeScript (strict) |
| Database | PostgreSQL (Neon atau Supabase untuk production) |
| ORM | Prisma |
| Auth | Auth.js (NextAuth) — Credentials provider, session JWT, role disimpan di token |
| Password | bcryptjs |
| Validasi | Zod (dipakai di API dan form) |
| UI | Tailwind CSS + shadcn/ui, ikon lucide-react |
| Form | react-hook-form + @hookform/resolvers/zod |
| Grafik | Recharts |
| PDF | @react-pdf/renderer (invoice & laporan bulanan) |
| Email (opsional) | Resend — kalau `RESEND_API_KEY` kosong, cukup notifikasi in-app |
| Analytics (opsional) | Google Analytics Data API (GA4) — kalau kredensial kosong, pakai input manual |
| Test | Vitest (unit test untuk `lib/`) |
| Hosting | Vercel (app + Vercel Cron), Cloudflare (DNS/proxy domain) |

Gaya API: **Route Handlers** di `src/app/api/**` (sesuai sprint backlog "Buat API CRUD"). Semua input divalidasi Zod, semua respons JSON dengan format:

```json
{ "data": ..., "error": null }
{ "data": null, "error": { "message": "…", "fields": { "email": "Email sudah dipakai" } } }
```

---

## 4. Peran dan Hak Akses

| Aksi | ADMIN | CLIENT |
|---|---|---|
| Kelola data klien & akun klien | ✅ | ❌ |
| Kelola website (domain, hosting, statistik, artikel) | ✅ | 👁 hanya lihat miliknya |
| Kelola proyek, sprint, task | ✅ | 👁 lihat ringkasan proyek miliknya (tanpa edit) |
| Kirim pesan di thread proyek | ✅ | ✅ hanya proyek miliknya |
| Setujui hasil / minta revisi proyek | ❌ | ✅ hanya proyek miliknya |
| Buat invoice, kirim, tandai lunas | ✅ | ❌ |
| Lihat & unduh invoice | ✅ | ✅ hanya miliknya |
| Ajukan permintaan (SLA) | ❌ | ✅ |
| Tinjau, setujui/tolak, update status permintaan | ✅ | ❌ |
| Unduh laporan bulanan website | ✅ | ✅ hanya miliknya |

**Aturan keamanan wajib:**
- `middleware.ts`: `/admin/**` hanya ADMIN, `/portal/**` hanya CLIENT, selain itu redirect ke `/login`.
- Setiap query data untuk CLIENT **wajib** difilter `clientId` dari session (bukan dari parameter URL). Buat helper `requireClient()` dan `requireAdmin()` di `lib/rbac.ts`.
- Akses ke resource milik klien lain mengembalikan **404** (bukan 403) agar tidak membocorkan keberadaan data.

---

## 5. Model Data (Prisma)

Mengembangkan ERD di BAB III (CLIENT, PROJECT, SPRINT, TASK, INVOICE, SLA_REQUEST) dengan tabel tambahan yang dibutuhkan sprint backlog: USER (akun login), WEBSITE, WEBSITE_STAT, ARTICLE, MESSAGE, INVOICE_ITEM, NOTIFICATION.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role { ADMIN CLIENT }
enum Platform { WORDPRESS NEXTJS REACT LARAVEL OTHER }
enum WebsiteStatus { ACTIVE MAINTENANCE INACTIVE }
enum DataSource { MANUAL GA4 WORDPRESS }
enum ArticleStatus { PUBLISHED DRAFT }
enum ProjectType { NEW_WEBSITE FEATURE REVISION CONTENT MAINTENANCE }
enum ProjectStatus { PLANNING IN_PROGRESS WAITING_APPROVAL REVISION DONE ON_HOLD }
enum SprintStatus { PLANNED ACTIVE DONE }
enum TaskStatus { TODO IN_PROGRESS DONE }
enum InvoiceStatus { DRAFT SENT PAID OVERDUE CANCELLED }
enum RequestType { ADD_CONTENT EDIT_CONTENT DESIGN_REVISION NEW_FEATURE BUG_FIX OTHER }
enum RequestPriority { LOW MEDIUM HIGH URGENT }
enum RequestStatus { SUBMITTED IN_REVIEW APPROVED REJECTED IN_PROGRESS DONE }

model User {
  id            String         @id @default(cuid())
  name          String
  email         String         @unique
  passwordHash  String
  role          Role
  clientId      String?
  client        Client?        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  messages      Message[]
  notifications Notification[]
  requests      SlaRequest[]   @relation("RequestCreator")
  createdAt     DateTime       @default(now())
}

model Client {
  id        String       @id @default(cuid())
  name      String       // nama PIC
  email     String
  phone     String?
  company   String
  address   String?
  notes     String?
  isActive  Boolean      @default(true)
  users     User[]
  websites  Website[]
  projects  Project[]
  requests  SlaRequest[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model Website {
  id              String        @id @default(cuid())
  clientId        String
  client          Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  domain          String        @unique
  platform        Platform
  hostingProvider String?
  hostingRenewAt  DateTime?
  domainRenewAt   DateTime?
  status          WebsiteStatus @default(ACTIVE)
  ga4PropertyId   String?       // opsional, untuk sinkron pengunjung
  wpApiUrl        String?       // opsional, contoh: https://domain.com/wp-json
  stats           WebsiteStat[]
  articles        Article[]
  projects        Project[]
  requests        SlaRequest[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model WebsiteStat {
  id        String     @id @default(cuid())
  websiteId String
  website   Website    @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  period    DateTime   // selalu tanggal 1 bulan tersebut (00:00 WIB)
  visitors  Int
  pageviews Int
  source    DataSource @default(MANUAL)
  updatedAt DateTime   @updatedAt

  @@unique([websiteId, period])
}

model Article {
  id          String        @id @default(cuid())
  websiteId   String
  website     Website       @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  title       String
  url         String?
  status      ArticleStatus @default(PUBLISHED)
  publishedAt DateTime?
  source      DataSource    @default(MANUAL)
  externalId  String?       // id post dari WordPress

  @@unique([websiteId, externalId])
}

model Project {
  id          String        @id @default(cuid())
  clientId    String
  client      Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  websiteId   String?
  website     Website?      @relation(fields: [websiteId], references: [id], onDelete: SetNull)
  name        String
  description String?
  type        ProjectType
  status      ProjectStatus @default(PLANNING)
  startDate   DateTime
  endDate     DateTime?
  approvedAt  DateTime?
  sprints     Sprint[]
  messages    Message[]
  invoices    Invoice[]
  requests    SlaRequest[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Sprint {
  id        String       @id @default(cuid())
  projectId String
  project   Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name      String
  goal      String?
  startDate DateTime
  endDate   DateTime
  status    SprintStatus @default(PLANNED)
  tasks     Task[]
}

model Task {
  id          String     @id @default(cuid())
  sprintId    String
  sprint      Sprint     @relation(fields: [sprintId], references: [id], onDelete: Cascade)
  title       String
  description String?
  status      TaskStatus @default(TODO)
  assignee    String?
  order       Int        @default(0)
  updatedAt   DateTime   @updatedAt
}

model Message {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  senderId  String
  sender    User     @relation(fields: [senderId], references: [id])
  body      String
  createdAt DateTime @default(now())
}

model Invoice {
  id         String        @id @default(cuid())
  projectId  String
  project    Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  number     String        @unique // format: INV/2026/09/0001
  amount     Decimal       @db.Decimal(14, 2) // = jumlah item
  status     InvoiceStatus @default(DRAFT)
  issuedDate DateTime
  dueDate    DateTime
  paidAt     DateTime?
  notes      String?
  items      InvoiceItem[]
  createdAt  DateTime      @default(now())
}

model InvoiceItem {
  id          String  @id @default(cuid())
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description String
  qty         Int     @default(1)
  unitPrice   Decimal @db.Decimal(14, 2)
}

model SlaRequest {
  id              String          @id @default(cuid())
  clientId        String
  client          Client          @relation(fields: [clientId], references: [id], onDelete: Cascade)
  websiteId       String?
  website         Website?        @relation(fields: [websiteId], references: [id], onDelete: SetNull)
  projectId       String?
  project         Project?        @relation(fields: [projectId], references: [id], onDelete: SetNull)
  createdById     String
  createdBy       User            @relation("RequestCreator", fields: [createdById], references: [id])
  type            RequestType
  priority        RequestPriority @default(MEDIUM)
  title           String
  description     String
  referenceUrl    String?         // link Google Drive / contoh desain
  status          RequestStatus   @default(SUBMITTED)
  adminResponse   String?
  rejectionReason String?
  dueAt           DateTime        // batas waktu respon (SLA)
  respondedAt     DateTime?       // pertama kali admin merespons
  resolvedAt      DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Notification {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String    // NEW_MESSAGE, NEW_REQUEST, REQUEST_UPDATED, INVOICE_SENT, WAITING_APPROVAL, RENEWAL_REMINDER
  title     String
  body      String
  link      String?
  dedupeKey String?   @unique // mencegah notifikasi ganda dari cron
  readAt    DateTime?
  createdAt DateTime  @default(now())
}
```

Catatan: nominal uang memakai `Decimal`, bukan `float`, supaya tidak ada selisih pembulatan.

---

## 6. Aturan Bisnis

### 6.1 Permintaan / SLA Request
- Jenis permintaan (label UI):
  - `ADD_CONTENT` → "Tambah Konten / Artikel"
  - `EDIT_CONTENT` → "Ubah Konten / Postingan"
  - `DESIGN_REVISION` → "Revisi Desain"
  - `NEW_FEATURE` → "Tambah Fitur"
  - `BUG_FIX` → "Laporkan Masalah / Error"
  - `OTHER` → "Lainnya"
- Target waktu respon (SLA) berdasarkan prioritas, disimpan di `lib/sla.ts` agar mudah diubah:

  | Prioritas | Label | Target respon |
  |---|---|---|
  | URGENT | Mendesak | 4 jam |
  | HIGH | Tinggi | 1 hari |
  | MEDIUM | Sedang | 3 hari |
  | LOW | Rendah | 5 hari |

  `dueAt = createdAt + target`. MVP memakai hari kalender, bukan hari kerja (catat di `DECISIONS.md`).
- Alur status (sesuai activity diagram "Request Perubahan"):
  ```
  SUBMITTED → IN_REVIEW → APPROVED → IN_PROGRESS → DONE
                        ↘ REJECTED (wajib isi rejectionReason)
  ```
  Transisi di luar alur ini ditolak API (400). Letakkan aturan transisi di `lib/sla.ts` → `canTransition(from, to)`.
- `respondedAt` diisi otomatis saat admin pertama kali mengubah status dari `SUBMITTED`.
- **Terlambat (overdue)**: `respondedAt == null && now > dueAt`. Tampilkan badge merah "Melewati SLA" di admin.
- Setiap perubahan status → notifikasi ke semua user klien terkait. Permintaan baru → notifikasi ke semua ADMIN.

### 6.2 Persetujuan Proyek (Approval)
- Admin mengubah status proyek menjadi `WAITING_APPROVAL` → klien dapat notifikasi.
- Di portal klien muncul dua tombol:
  - **"Setujui Hasil"** → status `DONE`, `approvedAt = now()`.
  - **"Minta Revisi"** → buka form permintaan (jenis default `DESIGN_REVISION`, `projectId` terisi), status proyek menjadi `REVISION`.

### 6.3 Progres Proyek
- `progres (%) = jumlah task DONE / total task di semua sprint proyek × 100`, dibulatkan. Kalau belum ada task → 0%.

### 6.4 Invoice
- Nomor otomatis: `INV/{YYYY}/{MM}/{urutan 4 digit per bulan}`. Buat di `lib/invoice.ts` dan diuji.
- "Generate dari proyek": form invoice terisi otomatis nama klien & proyek; `issuedDate = hari ini`, `dueDate = +14 hari`.
- `amount` dihitung ulang di server dari item (jangan percaya nilai dari client).
- Status: `DRAFT` → (Kirim) `SENT` → (Tandai Lunas) `PAID`. `DRAFT/SENT` bisa `CANCELLED`.
- `SENT` yang lewat `dueDate` → `OVERDUE` (diset oleh cron harian, dan juga dicek saat ditampilkan).
- Klien hanya melihat invoice berstatus `SENT`, `PAID`, `OVERDUE` (DRAFT disembunyikan).

### 6.5 Data Website
- **Pengunjung**: sumber utama input manual per bulan oleh admin (`WebsiteStat`). Kalau `ga4PropertyId` dan kredensial GA4 tersedia, cron harian menyinkronkan data bulan berjalan (source `GA4`). Buat adapter di `lib/integrations/ga4.ts` yang aman kalau kredensial kosong (langsung return, tidak error).
- **Artikel**: input manual oleh admin. Kalau `wpApiUrl` terisi, tombol "Sinkron dari WordPress" mengambil `/wp/v2/posts` (judul, link, tanggal, id) dan upsert berdasarkan `externalId`. Adapter di `lib/integrations/wordpress.ts`.
- **Pengingat perpanjangan**: cron harian membuat notifikasi saat `domainRenewAt` atau `hostingRenewAt` tinggal **30 hari** dan **7 hari**, untuk admin dan klien. Pakai `dedupeKey` (contoh: `renew:{websiteId}:domain:30`) agar tidak dobel.

### 6.6 Pesan Proyek
- Satu thread per proyek, urut waktu lama → baru.
- Pesan baru → notifikasi ke pihak lain (klien → semua admin, admin → user klien).
- Tidak realtime: halaman melakukan polling tiap 15 detik saat tab aktif.

---

## 7. Halaman dan Fitur

### 7.1 Umum
- `/login` — email + password. Setelah login: ADMIN → `/admin`, CLIENT → `/portal`.
- Layout: sidebar kiri + header (nama pengguna, lonceng notifikasi dengan jumlah belum dibaca, tombol keluar). Mengikuti wireframe di BAB III (Gambar 3.4–3.8).
- Responsif sampai lebar 360px (klien banyak buka dari HP).
- Semua tanggal format Indonesia (`30 Sep 2026`), uang format `Rp 1.500.000`.
- Setiap list punya empty state yang ramah ("Belum ada permintaan. Klik 'Ajukan Permintaan' untuk memulai.").

### 7.2 Portal Admin (`/admin`)

| Route | Isi |
|---|---|
| `/admin` | Dashboard: kartu ringkasan (klien aktif, proyek berjalan, permintaan baru, permintaan melewati SLA, invoice belum lunas, domain/hosting habis ≤30 hari) + daftar 5 permintaan terbaru + daftar perpanjangan terdekat |
| `/admin/clients` | Tabel klien (cari berdasarkan nama/perusahaan), tombol tambah |
| `/admin/clients/new` | Form klien + buat akun login klien (nama, email, password awal) |
| `/admin/clients/[id]` | Profil klien, tab: Website, Proyek (riwayat), Permintaan, Invoice, Akun Login |
| `/admin/websites/[id]` | Detail website: info domain & hosting (edit), grafik pengunjung 6 bulan, form input statistik bulanan, daftar artikel (tambah/edit/hapus, tombol sinkron WordPress kalau tersedia) |
| `/admin/projects` | Daftar semua proyek, filter status & klien |
| `/admin/projects/new` | Form proyek (pilih klien → website miliknya) |
| `/admin/projects/[id]` | Tab: Ringkasan (status, progres, ubah status), Sprint & Task (kanban 3 kolom TODO / IN_PROGRESS / DONE per sprint, pindah status via tombol atau drag), Pesan, Invoice |
| `/admin/requests` | Kotak masuk permintaan: filter status, prioritas, klien; urutan default: melewati SLA dulu, lalu `dueAt` terdekat |
| `/admin/requests/[id]` | Detail permintaan, ubah status sesuai alur, isi tanggapan/alasan penolakan |
| `/admin/invoices` | Daftar invoice, filter status |
| `/admin/invoices/new?projectId=` | Form invoice dengan item dinamis |
| `/admin/invoices/[id]` | Detail, tombol Kirim / Tandai Lunas / Batalkan / Unduh PDF |

### 7.3 Portal Klien (`/portal`)

| Route | Isi |
|---|---|
| `/portal` | Dashboard per website (kartu): domain, status website, masa aktif domain & hosting (warna kuning ≤30 hari, merah ≤7 hari), pengunjung bulan ini + perbandingan bulan lalu, grafik 6 bulan, jumlah artikel terbit, proyek aktif + progres. Banner kalau ada proyek menunggu persetujuan |
| `/portal/websites/[id]` | Detail website: statistik & daftar artikel |
| `/portal/projects` | Daftar proyek miliknya |
| `/portal/projects/[id]` | Status & progres (bahasa sederhana), ringkasan sprint (tanpa detail teknis task), thread pesan, tombol Setujui / Minta Revisi saat `WAITING_APPROVAL` |
| `/portal/requests` | Daftar permintaan + status + tanggapan admin |
| `/portal/requests/new` | Form: pilih website, jenis permintaan, prioritas, judul, deskripsi, link referensi (opsional). Tampilkan perkiraan waktu respon sesuai prioritas |
| `/portal/invoices` | Daftar invoice + tombol Unduh PDF |
| `/portal/reports` | Pilih website & bulan → Unduh Laporan Bulanan (PDF) |

### 7.4 Laporan Bulanan (PDF)
Isi: nama klien & website, periode, pengunjung & pageview (dibanding bulan lalu), artikel terbit bulan itu, permintaan yang diselesaikan bulan itu, status proyek aktif, tanggal perpanjangan domain/hosting.

---

## 8. Daftar API (Route Handlers)

Semua di `src/app/api`. `[A]` = hanya admin, `[C]` = hanya klien (terfilter clientId), `[A/C]` = keduanya dengan filter.

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET/POST | `/api/clients` | A | list / buat klien (+ akun login opsional) |
| GET/PATCH/DELETE | `/api/clients/[id]` | A | detail / ubah / nonaktifkan (soft: `isActive=false`) |
| POST | `/api/clients/[id]/users` | A | tambah akun login klien |
| GET/POST | `/api/websites` | A/C | C hanya miliknya; POST hanya A |
| GET/PATCH/DELETE | `/api/websites/[id]` | A/C | ubah & hapus hanya A |
| PUT | `/api/websites/[id]/stats` | A | upsert statistik bulanan |
| GET/POST | `/api/websites/[id]/articles` | A/C | POST hanya A |
| PATCH/DELETE | `/api/articles/[id]` | A | |
| POST | `/api/websites/[id]/sync-wordpress` | A | sinkron artikel |
| GET/POST | `/api/projects` | A/C | POST hanya A |
| GET/PATCH/DELETE | `/api/projects/[id]` | A/C | ubah & hapus hanya A |
| POST | `/api/projects/[id]/approve` | C | Setujui hasil |
| POST | `/api/projects/[id]/request-revision` | C | buat SlaRequest + status REVISION |
| GET/POST | `/api/projects/[id]/sprints` | A | |
| PATCH/DELETE | `/api/sprints/[id]` | A | |
| POST | `/api/sprints/[id]/tasks` | A | |
| PATCH/DELETE | `/api/tasks/[id]` | A | termasuk pindah status |
| GET/POST | `/api/projects/[id]/messages` | A/C | |
| GET/POST | `/api/invoices` | A/C | C tanpa DRAFT; POST hanya A |
| GET/PATCH | `/api/invoices/[id]` | A/C | PATCH hanya A |
| POST | `/api/invoices/[id]/send` \| `/mark-paid` \| `/cancel` | A | |
| GET | `/api/invoices/[id]/pdf` | A/C | |
| GET/POST | `/api/requests` | A/C | POST hanya C |
| GET | `/api/requests/[id]` | A/C | |
| PATCH | `/api/requests/[id]/status` | A | validasi `canTransition` |
| GET | `/api/reports/monthly?websiteId=&month=YYYY-MM` | A/C | PDF |
| GET | `/api/notifications` | A/C | milik user login |
| POST | `/api/notifications/read` | A/C | tandai dibaca (satu / semua) |
| GET | `/api/cron/daily` | header `Authorization: Bearer ${CRON_SECRET}` | pengingat perpanjangan, invoice overdue, sinkron GA4 |

`vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/daily", "schedule": "0 1 * * *" }] }
```
(01:00 UTC = 08:00 WIB)

---

## 9. Struktur Folder

```
src/
  app/
    (auth)/login/page.tsx
    admin/            # layout + halaman admin
    portal/           # layout + halaman klien
    api/              # route handlers
  components/
    ui/               # shadcn
    admin/
    portal/
    shared/           # sidebar, header, notification-bell, status-badge, empty-state, charts
  lib/
    prisma.ts
    auth.ts
    rbac.ts           # requireAdmin(), requireClient()
    sla.ts            # target SLA, canTransition(), isOverdue()
    invoice.ts        # generateInvoiceNumber(), hitung total
    progress.ts       # hitung progres proyek
    notify.ts         # buat notifikasi (+ email opsional)
    format.ts         # tanggal & rupiah
    labels.ts         # label Bahasa Indonesia untuk semua enum
    validations/      # skema Zod per entitas
    integrations/
      ga4.ts
      wordpress.ts
    pdf/
      invoice-pdf.tsx
      monthly-report-pdf.tsx
  middleware.ts
prisma/
  schema.prisma
  seed.ts
tests/                # vitest untuk lib/
DECISIONS.md
README.md
.env.example
```

`.env.example`:
```
DATABASE_URL=
AUTH_SECRET=
CRON_SECRET=
RESEND_API_KEY=          # opsional
EMAIL_FROM=              # opsional
GA4_CLIENT_EMAIL=        # opsional
GA4_PRIVATE_KEY=         # opsional
APP_URL=http://localhost:3000
```

---

## 10. Data Seed (untuk demo & pengujian)

`prisma/seed.ts` harus idempoten (boleh hapus lalu isi ulang). Isi:
- 1 admin: `admin@boowat.com` / `admin123`
- 3 klien, masing-masing 1 akun login (`klien1@contoh.com` / `klien123`, dst.)
- 4 website (satu klien punya 2 website), campuran WordPress & Next.js; salah satu domain habis dalam 10 hari
- Statistik pengunjung 6 bulan terakhir per website
- 5–10 artikel per website
- 4 proyek dengan status berbeda (salah satunya `WAITING_APPROVAL`), masing-masing 1–2 sprint dan beberapa task
- Beberapa pesan di thread proyek
- 4 invoice (DRAFT, SENT, PAID, OVERDUE)
- 6 permintaan dengan status & prioritas berbeda, termasuk 1 yang melewati SLA

Tulis kredensial demo di `README.md`.

---

## 11. Rencana Pengerjaan (mengikuti Sprint di skripsi)

### Fase 0 — Setup
- Inisialisasi Next.js + TypeScript + Tailwind + shadcn/ui + Prisma + Auth.js.
- Schema Prisma lengkap (Bagian 5), migrasi, seed.
- Login, middleware role, layout admin & portal (sidebar, header, lonceng notifikasi kosong).
- `lib/format.ts`, `lib/labels.ts`, `lib/rbac.ts`.
- **Selesai jika**: bisa login sebagai admin & klien, diarahkan ke portal masing-masing, akses silang ditolak.

### Fase 1 — Sprint 1 (PB-01, PB-02, PB-04)
- PB-01 Kelola klien: CRUD klien, akun login klien, halaman list & detail (profil + riwayat proyek).
- Kelola proyek, sprint, task + kanban (dasar untuk pelacakan sprint).
- PB-02 Komunikasi: thread pesan per proyek (admin & klien) + notifikasi.
- PB-04 Data website: CRUD website, input statistik, artikel, dashboard klien, detail website, pengingat perpanjangan via cron.
- Integrasi GA4 & WordPress sebagai adapter opsional.
- **Selesai jika**: klien melihat dashboard lengkap dengan data seed; admin bisa kelola klien, website, proyek, sprint, task; pesan terkirim dua arah.

### Fase 2 — Sprint 2 (PB-03, PB-05)
- PB-03 Invoice: generate dari proyek, item, kirim, tandai lunas, batal, PDF, overdue via cron.
- PB-05 Permintaan: form klien, kotak masuk admin, alur status, SLA & badge overdue, notifikasi.
- Approval proyek (Setujui / Minta Revisi).
- Laporan bulanan PDF.
- Dashboard admin (kartu ringkasan).
- **Selesai jika**: semua skenario di Bagian 13 lolos secara manual.

### Fase 3 — Rapikan & Uji
- Unit test Vitest untuk `lib/sla.ts`, `lib/invoice.ts`, `lib/progress.ts`, `lib/rbac.ts`.
- Cek tampilan mobile 360px, empty state, pesan error yang jelas.
- `README.md`: cara install, env, migrasi, seed, deploy ke Vercel, kredensial demo.
- Buat `docs/blackbox-checklist.md` dari Bagian 13 dengan kolom Hasil (Pass/Fail) kosong untuk diisi saat pengujian.

---

## 12. Keterlacakan Kebutuhan (Product Backlog → Fitur)

| ID | User Story | Fitur di MVP |
|---|---|---|
| PB-01 | Admin ingin mengakses informasi klien agar mudah mengelola kebutuhan klien | Kelola klien, detail klien, akun login klien |
| PB-02 | Admin ingin mengelola permintaan klien dengan mudah agar komunikasi lancar | Thread pesan proyek, kotak masuk permintaan, notifikasi |
| PB-03 | Admin ingin mengirim invoice dengan mudah agar pembayaran lebih cepat | Generate invoice dari proyek, kirim, PDF, status lunas |
| PB-04 | Klien ingin melihat data website mereka untuk keperluan marketing dll | Dashboard klien: domain, hosting, pengunjung, artikel, laporan bulanan |
| PB-05 | Klien ingin mengajukan perubahan dengan mudah agar pengembangan lebih cepat | Form permintaan, status & SLA, approval / minta revisi |

---

## 13. Skenario Uji Black-Box (acuan BAB IV)

| No | Fitur | Skenario | Hasil yang diharapkan |
|---|---|---|---|
| BB-01 | Login | Email & password admin benar | Masuk ke `/admin` |
| BB-02 | Login | Password salah | Muncul pesan "Email atau password salah", tetap di `/login` |
| BB-03 | Hak akses | Klien membuka `/admin` | Diarahkan ke `/portal` atau `/login` |
| BB-04 | Hak akses | Klien A membuka URL proyek milik klien B | Halaman 404 |
| BB-05 | Kelola klien | Admin tambah klien dengan data lengkap | Klien muncul di daftar, akun login bisa dipakai |
| BB-06 | Kelola klien | Admin tambah klien dengan email yang sudah dipakai akun lain | Muncul pesan validasi, data tidak tersimpan |
| BB-07 | Website | Admin input statistik bulan berjalan | Angka pengunjung di dashboard klien berubah |
| BB-08 | Website | Domain habis ≤7 hari | Kartu website klien berwarna merah + notifikasi pengingat |
| BB-09 | Proyek | Admin pindahkan task ke DONE | Progres proyek bertambah di admin & portal klien |
| BB-10 | Pesan | Klien kirim pesan di proyek | Pesan tampil di thread admin, admin dapat notifikasi |
| BB-11 | Permintaan | Klien kirim form tanpa judul | Muncul pesan validasi, tidak terkirim |
| BB-12 | Permintaan | Klien kirim permintaan prioritas Tinggi | Status "Diajukan", batas respon = +1 hari, admin dapat notifikasi |
| BB-13 | Permintaan | Admin tolak permintaan tanpa alasan | Ditolak sistem, alasan wajib diisi |
| BB-14 | Permintaan | Admin tolak dengan alasan | Klien melihat status "Ditolak" beserta alasannya |
| BB-15 | Permintaan | Permintaan belum direspons melewati batas waktu | Badge "Melewati SLA" tampil di admin |
| BB-16 | Approval | Klien klik "Setujui Hasil" pada proyek menunggu persetujuan | Status proyek "Selesai", tanggal persetujuan tercatat |
| BB-17 | Approval | Klien klik "Minta Revisi" | Permintaan revisi baru terbuat, status proyek "Revisi" |
| BB-18 | Invoice | Admin generate invoice dari proyek | Nomor invoice otomatis, data klien & proyek terisi |
| BB-19 | Invoice | Admin kirim invoice | Klien melihat invoice & dapat notifikasi |
| BB-20 | Invoice | Klien unduh invoice | File PDF terunduh dengan data yang benar |
| BB-21 | Invoice | Invoice DRAFT | Tidak terlihat di portal klien |
| BB-22 | Laporan | Klien unduh laporan bulanan | PDF berisi statistik, artikel, dan permintaan bulan tersebut |

---

## 14. Kriteria Selesai MVP (Definition of Done)

- Semua fitur di Bagian 7 berjalan dengan data seed.
- Semua skenario Bagian 13 lolos saat dicoba manual.
- Typecheck, lint, build, dan unit test lolos.
- Tidak ada data klien yang bisa diakses klien lain (BB-04 lolos untuk proyek, website, invoice, permintaan, laporan).
- Semua teks UI dalam Bahasa Indonesia.
- Tampilan layak di layar 360px dan desktop.
- Bisa di-deploy ke Vercel dengan database PostgreSQL online, cron berjalan.

---

## 15. Standar Kualitas UI dan Kode (Hindari Tampilan "Hasil Generate AI")

Tujuan bagian ini: aplikasi terlihat seperti produk internal agency yang dipakai sehari-hari, bukan template demo. Penguji juga bisa membuka kode saat sidang, jadi kode harus rapi dan bisa dijelaskan baris per baris.

### 15.1 Tampilan (UI)

| Jangan | Gantinya |
|---|---|
| Gradient ungu/biru, teks gradient, efek kaca (glassmorphism), blob/bentuk abstrak di background | Latar putih/abu muda polos. Satu warna utama (warna brand Boowat, simpan di `tailwind.config` sebagai `primary`), sisanya abu-abu netral. Warna lain hanya untuk status (hijau selesai, kuning menunggu, merah terlambat) |
| Emoji di judul, tombol, toast, atau menu | Ikon lucide-react seperlunya: hanya di menu sidebar dan tombol aksi utama. Jangan pasang ikon di setiap label |
| Halaman landing / hero ("Kelola proyek lebih mudah ✨") | `/` langsung redirect ke `/login`. Halaman login sederhana: logo Boowat, form, selesai |
| Semua kartu `rounded-2xl shadow-lg` + efek hover membesar | Radius kecil (`rounded-md`), border tipis `border-gray-200`, tanpa bayangan tebal, tanpa animasi hover selain perubahan warna |
| Animasi masuk di semua elemen (fade/slide), loading spinner berputar lama | Tanpa library animasi. Loading pakai skeleton sederhana |
| Kartu statistik palsu ("+12,5% dari bulan lalu") atau grafik dengan angka acak | Semua angka dari database. Kalau data belum ada, tampilkan "Belum ada data", bukan angka dummy |
| Menu yang tidak ada isinya (Pengaturan, Bantuan, Analytics, Tim) | Sidebar hanya berisi halaman yang benar-benar ada di Bagian 7 |
| Toggle dark mode, pemilih bahasa, avatar ilustrasi | Tidak dibuat (di luar cakupan) |
| Campur bahasa di UI ("Dashboard", "Submit", "Oops! Something went wrong") | Seluruh UI Bahasa Indonesia: "Beranda", "Kirim", "Gagal menyimpan. Periksa kembali isian Anda." |
| Teks marketing di dalam aplikasi ("Tingkatkan produktivitas tim Anda!") | Teks fungsional saja: judul halaman, label, dan petunjuk singkat |
| Tabel dengan badge warna-warni di setiap kolom | Badge hanya untuk kolom status. Kolom lain teks biasa |
| Semua konten rata tengah dengan ruang kosong berlebihan | Rata kiri, lebar konten maksimal `max-w-7xl`, tabel memenuhi lebar |
| Footer "Made with ❤️" atau "© 2024" | Tanpa footer, atau cukup "Boowat.com" |

**Aturan tipografi:** satu font untuk seluruh aplikasi (pakai `Plus Jakarta Sans` dari `next/font/google`, atau font yang dipakai website Boowat). Ukuran: judul halaman `text-xl font-semibold`, subjudul `text-base font-medium`, isi `text-sm`. Jangan pakai `font-bold`/`text-3xl` ke atas di dalam aplikasi.

**shadcn/ui:** boleh dipakai, tapi ubah token warnanya (`--primary`, `--radius`) di `globals.css` agar tidak berwarna default. Jangan tambahkan komponen yang tidak dipakai.

### 15.2 Data Contoh (Seed)

- Jangan pakai "John Doe", "Acme Corp", "Lorem ipsum", `example.com`, atau foto stok.
- Pakai data yang masuk akal untuk agency di Indonesia: nama klien seperti "Klinik Gigi Senyum Sehat", "CV Kopi Nusantara", nama PIC Indonesia, domain `.co.id` / `.com` fiktif, judul artikel berbahasa Indonesia yang sesuai bidang klien, nominal invoice realistis (Rp 1.500.000–Rp 15.000.000).
- Tanggal seed dihitung relatif dari hari ini (bukan tanggal tetap), supaya data "terlambat" dan "habis 7 hari lagi" selalu benar saat demo.

### 15.3 Kode

| Jangan | Gantinya |
|---|---|
| Satu file halaman berisi ratusan baris (form, tabel, fetch jadi satu) | File halaman tipis. Pecah ke komponen di `components/admin` / `components/portal`. Batas kasar: 200 baris per file |
| Komentar yang menjelaskan hal jelas (`// fungsi untuk handle klik`), komentar emoji, `// TODO` yang tertinggal | Komentar hanya untuk alasan bisnis yang tidak terlihat dari kode, contoh: `// 404 bukan 403 agar keberadaan data klien lain tidak bocor` |
| Tipe `any`, `@ts-ignore`, `eslint-disable` | Tipe jelas. Pakai tipe hasil Prisma dan `z.infer` dari skema Zod |
| `console.log` sisa debugging, import tidak terpakai, kode mati | Bersihkan sebelum commit. `npm run lint` wajib tanpa warning |
| Data dummy di dalam komponen (`const projects = [...]`) | Semua data dari database lewat Prisma |
| Tombol atau menu yang tidak berfungsi | Kalau belum dikerjakan, jangan ditampilkan |
| Nama variabel campur ("dataKlien", "getProyek", "handleSubmitForm2") | Kode (variabel, fungsi, file) bahasa Inggris konsisten (`client`, `getProjects`). Hanya teks UI yang bahasa Indonesia, dan semuanya lewat `lib/labels.ts` |
| Abstraksi berlebihan (generic repository, factory, hook untuk hal yang dipakai sekali) | Tulis langsung dan sederhana. Buat helper hanya kalau dipakai di 3 tempat atau lebih |
| Pesan error umum ("Something went wrong") | Pesan spesifik per kasus, dari validasi Zod (contoh: "Judul permintaan wajib diisi") |
| Library yang dipasang tapi tidak dipakai | Hapus dari `package.json` |
| README penuh badge dan emoji | README singkat: deskripsi, cara install, env, migrasi & seed, kredensial demo, cara deploy |

### 15.4 Cek Akhir Setiap Fase

Sebelum menutup fase, jalankan dan pastikan:

1. `grep -rnE "console\.log|: any|@ts-ignore|eslint-disable|TODO|lorem|John Doe|Acme" src/` → hasil kosong.
2. `grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src/` → tidak ada emoji.
3. `grep -rnE "bg-gradient|backdrop-blur|shadow-2xl|animate-" src/` → hasil kosong (kecuali `animate-pulse` untuk skeleton).
4. Buka setiap halaman di lebar 360px dan 1280px. Tidak ada teks bahasa Inggris, tidak ada tombol mati, tidak ada angka dummy.
5. Setiap halaman list punya tiga keadaan yang sudah dicek: ada data, kosong (empty state), dan loading.
6. Tulis `docs/catatan-kode.md`: untuk setiap fitur (PB-01 s.d. PB-05), sebutkan file utama yang terlibat dan alur singkatnya (halaman → API → validasi → database). Dokumen ini untuk persiapan menjelaskan kode saat sidang.
