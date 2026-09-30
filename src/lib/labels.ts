import type {
  ArticleStatus,
  DataSource,
  InvoiceStatus,
  Platform,
  ProjectStatus,
  ProjectType,
  RequestPriority,
  RequestStatus,
  RequestType,
  Role,
  SprintStatus,
  TaskStatus,
  WebsiteStatus,
} from "@prisma/client";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  CLIENT: "Klien",
};

export const platformLabels: Record<Platform, string> = {
  WORDPRESS: "WordPress",
  NEXTJS: "Next.js",
  REACT: "React",
  LARAVEL: "Laravel",
  OTHER: "Lainnya",
};

export const websiteStatusLabels: Record<WebsiteStatus, string> = {
  ACTIVE: "Aktif",
  MAINTENANCE: "Dalam Perawatan",
  INACTIVE: "Tidak Aktif",
};

export const dataSourceLabels: Record<DataSource, string> = {
  MANUAL: "Input Manual",
  GA4: "Google Analytics",
  WORDPRESS: "WordPress",
};

export const articleStatusLabels: Record<ArticleStatus, string> = {
  PUBLISHED: "Terbit",
  DRAFT: "Draf",
};

export const projectTypeLabels: Record<ProjectType, string> = {
  NEW_WEBSITE: "Website Baru",
  FEATURE: "Penambahan Fitur",
  REVISION: "Revisi",
  CONTENT: "Konten",
  MAINTENANCE: "Pemeliharaan",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  PLANNING: "Perencanaan",
  IN_PROGRESS: "Sedang Dikerjakan",
  WAITING_APPROVAL: "Menunggu Persetujuan",
  REVISION: "Revisi",
  DONE: "Selesai",
  ON_HOLD: "Ditunda",
};

export const sprintStatusLabels: Record<SprintStatus, string> = {
  PLANNED: "Direncanakan",
  ACTIVE: "Berjalan",
  DONE: "Selesai",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "Belum Dikerjakan",
  IN_PROGRESS: "Sedang Dikerjakan",
  DONE: "Selesai",
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Draf",
  SENT: "Terkirim",
  PAID: "Lunas",
  OVERDUE: "Lewat Jatuh Tempo",
  CANCELLED: "Dibatalkan",
};

export const requestTypeLabels: Record<RequestType, string> = {
  ADD_CONTENT: "Tambah Konten / Artikel",
  EDIT_CONTENT: "Ubah Konten / Postingan",
  DESIGN_REVISION: "Revisi Desain",
  NEW_FEATURE: "Tambah Fitur",
  BUG_FIX: "Laporkan Masalah / Error",
  OTHER: "Lainnya",
};

export const requestPriorityLabels: Record<RequestPriority, string> = {
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
  URGENT: "Mendesak",
};

export const requestStatusLabels: Record<RequestStatus, string> = {
  SUBMITTED: "Diajukan",
  IN_REVIEW: "Sedang Ditinjau",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  IN_PROGRESS: "Sedang Dikerjakan",
  DONE: "Selesai",
};

export const navLabels = {
  dashboard: "Beranda",
  clients: "Klien",
  websites: "Website",
  projects: "Proyek",
  requests: "Permintaan",
  invoices: "Invoice",
  reports: "Laporan",
} as const;

export const uiText = {
  appName: "Boowat",
  adminPortal: "Portal Admin",
  clientPortal: "Portal Klien",
  menu: "Menu",
  toggleSidebar: "Buka atau tutup menu samping",
  logout: "Keluar",
  notifications: "Notifikasi",
  noNotifications: "Belum ada notifikasi.",
  markAllRead: "Tandai semua dibaca",
  unreadNotifications: (count: number) => `${count} notifikasi belum dibaca`,
  greeting: (name: string) => `Selamat datang, ${name}.`,
  notFoundTitle: "Halaman tidak ditemukan",
  notFoundBody: "Halaman yang Anda buka tidak ada atau sudah dipindahkan.",
  backToHome: "Kembali ke beranda",
  errorTitle: "Terjadi kesalahan",
  errorBody: "Halaman ini gagal dimuat. Coba lagi beberapa saat; bila masih gagal, hubungi tim Boowat.",
  errorCode: (digest: string) => `Kode kesalahan: ${digest}`,
  retry: "Coba lagi",
  save: "Simpan",
  saving: "Menyimpan...",
  cancel: "Batal",
  delete: "Hapus",
  edit: "Ubah",
  processing: "Memproses...",
  saved: "Perubahan berhasil disimpan.",
  saveFailed: "Gagal menyimpan. Periksa kembali isian Anda.",
} as const;

export const authText = {
  title: "Masuk ke akun Anda",
  subtitle: "Gunakan email dan password yang diberikan oleh tim Boowat.",
  panelTitle: "Portal proyek dan klien Boowat.com",
  panelBody: "Pantau progres proyek, data website, invoice, dan permintaan perubahan dalam satu tempat.",
  email: "Email",
  password: "Password",
  submit: "Masuk",
  submitting: "Memproses...",
  invalidCredentials: "Email atau password salah",
  emailRequired: "Email wajib diisi",
  emailInvalid: "Format email tidak valid",
  passwordRequired: "Password wajib diisi",
} as const;
