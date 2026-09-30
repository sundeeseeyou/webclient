import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const WIB_OFFSET = 7 * HOUR;
const now = new Date();

// Semua tanggal relatif dari waktu seed dijalankan, supaya data "terlambat" dan "habis 7 hari lagi" selalu benar saat demo.
const hoursFromNow = (hours: number) => new Date(now.getTime() + hours * HOUR);
const daysFromNow = (days: number) => new Date(now.getTime() + days * DAY);

function monthStartWib(monthsAgo: number): Date {
  const wib = new Date(now.getTime() + WIB_OFFSET);
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth() - monthsAgo, 1) - WIB_OFFSET);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const SLA_HOURS = { URGENT: 4, HIGH: 24, MEDIUM: 72, LOW: 120 } as const;
const VISITOR_TREND = [0.82, 0.88, 0.93, 0.9, 1, 1.07];

const clientSeeds = [
  {
    company: "Klinik Gigi Senyum Sehat",
    name: "drg. Ayu Lestari",
    email: "ayu.lestari@senyumsehat.co.id",
    phone: "081234567801",
    address: "Jl. Dago No. 112, Bandung",
    websites: [
      {
        domain: "senyumsehat.co.id", platform: "WORDPRESS", hostingProvider: "Niagahoster",
        hostingRenewDays: 25, domainRenewDays: 140, visitors: 1850, pageviewRatio: 2.4,
        articles: [
          "5 Cara Merawat Gigi Anak agar Tidak Berlubang",
          "Kapan Waktu yang Tepat untuk Scaling Gigi?",
          "Mengenal Perawatan Saluran Akar",
          "Tips Memilih Sikat Gigi yang Tepat",
          "Behel atau Aligner: Mana yang Cocok untuk Anda?",
          "Penyebab Gigi Sensitif dan Cara Mengatasinya",
        ],
      },
    ],
  },
  {
    company: "CV Kopi Nusantara",
    name: "Budi Santoso",
    email: "budi@kopinusantara.co.id",
    phone: "081298765402",
    address: "Jl. Kemang Raya No. 45, Jakarta Selatan",
    websites: [
      {
        domain: "kopinusantara.co.id", platform: "NEXTJS", hostingProvider: "Vercel",
        hostingRenewDays: 200, domainRenewDays: 95, visitors: 3200, pageviewRatio: 3.1,
        articles: [
          "Mengenal Perbedaan Kopi Arabika dan Robusta",
          "Cerita Petani Kopi Gayo di Balik Secangkir Kopi",
          "Cara Menyeduh Kopi V60 di Rumah",
          "Kopi Nusantara Kini Hadir di Bandung",
          "Panduan Memilih Biji Kopi untuk Pemula",
        ],
      },
      {
        domain: "belikopinusantara.com", platform: "WORDPRESS", hostingProvider: "Rumahweb",
        hostingRenewDays: 60, domainRenewDays: 300, visitors: 1400, pageviewRatio: 2.2,
        articles: [
          "Promo Kemerdekaan: Diskon 17% Semua Varian",
          "Paket Hampers Kopi untuk Kantor",
          "Cara Menyimpan Biji Kopi agar Tetap Segar",
          "Rekomendasi Kopi untuk Cold Brew",
          "Gratis Ongkir ke Seluruh Pulau Jawa",
          "Mengenal Proses Natural, Honey, dan Full Wash",
        ],
      },
    ],
  },
  {
    company: "Batik Laras Solo",
    name: "Siti Rahmawati",
    email: "siti@batiklaras.com",
    phone: "081377788903",
    address: "Jl. Slamet Riyadi No. 210, Surakarta",
    websites: [
      {
        domain: "batiklaras.com", platform: "NEXTJS", hostingProvider: "Vercel",
        hostingRenewDays: 120, domainRenewDays: 10, visitors: 950, pageviewRatio: 2.8,
        articles: [
          "Makna Motif Parang dalam Batik Solo",
          "Cara Mencuci Batik Tulis agar Warnanya Awet",
          "Koleksi Batik Kerja Terbaru",
          "Perbedaan Batik Tulis, Cap, dan Printing",
          "Tips Memadukan Batik untuk Acara Formal",
          "Batik Laras di Pameran Inacraft",
          "Sejarah Kampung Batik Laweyan",
        ],
      },
    ],
  },
] as const;

async function reset() {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.message.deleteMany(),
    prisma.slaRequest.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.project.deleteMany(),
    prisma.website.deleteMany(),
    prisma.user.deleteMany(),
    prisma.client.deleteMany(),
  ]);
}

async function seedClients() {
  const passwordHash = await bcrypt.hash("klien123", 10);
  return Promise.all(
    clientSeeds.map(({ websites, ...client }, index) =>
      prisma.client.create({
        data: {
          ...client,
          users: {
            create: { name: client.name, email: `klien${index + 1}@contoh.com`, passwordHash, role: "CLIENT" },
          },
          websites: {
            create: websites.map((site) => ({
              domain: site.domain,
              platform: site.platform,
              hostingProvider: site.hostingProvider,
              hostingRenewAt: daysFromNow(site.hostingRenewDays),
              domainRenewAt: daysFromNow(site.domainRenewDays),
              stats: {
                create: VISITOR_TREND.map((factor, i) => {
                  const visitors = Math.round(site.visitors * factor);
                  return { period: monthStartWib(5 - i), visitors, pageviews: Math.round(visitors * site.pageviewRatio) };
                }),
              },
              articles: {
                create: site.articles.map((title, i) => {
                  const isDraft = i === site.articles.length - 1;
                  return {
                    title,
                    url: `https://${site.domain}/${slugify(title)}`,
                    status: isDraft ? "DRAFT" : "PUBLISHED",
                    publishedAt: isDraft ? null : daysFromNow(-(i * 23 + 4)),
                  } as const;
                }),
              },
            })),
          },
        },
        include: { users: true, websites: true },
      }),
    ),
  );
}

async function main() {
  await reset();

  const admin = await prisma.user.create({
    data: { name: "Dimas Ardiansyah", email: "admin@boowat.com", passwordHash: await bcrypt.hash("admin123", 10), role: "ADMIN" },
  });
  const [klinik, kopi, batik] = await seedClients();
  const site = (domain: string) => {
    const found = [klinik, kopi, batik].flatMap((c) => c.websites).find((w) => w.domain === domain);
    if (!found) throw new Error(`Website ${domain} tidak ada di seed`);
    return found.id;
  };

  const redesign = await prisma.project.create({
    data: {
      clientId: klinik.id, websiteId: site("senyumsehat.co.id"), name: "Redesain Halaman Layanan",
      description: "Desain ulang halaman layanan agar pasien mudah menemukan jadwal dan harga perawatan.",
      type: "FEATURE", status: "WAITING_APPROVAL", startDate: daysFromNow(-40), endDate: daysFromNow(-2),
      sprints: {
        create: [
          {
            name: "Sprint 1", goal: "Desain dan persetujuan tampilan", startDate: daysFromNow(-40), endDate: daysFromNow(-26), status: "DONE",
            tasks: { create: [
              { title: "Kumpulkan konten layanan dari klinik", status: "DONE", assignee: "Rina Wulandari", order: 0 },
              { title: "Desain tampilan halaman layanan", status: "DONE", assignee: "Rina Wulandari", order: 1 },
            ] },
          },
          {
            name: "Sprint 2", goal: "Implementasi di WordPress", startDate: daysFromNow(-25), endDate: daysFromNow(-2), status: "DONE",
            tasks: { create: [
              { title: "Buat template halaman layanan", status: "DONE", assignee: "Fajar Nugroho", order: 0 },
              { title: "Pasang tabel harga perawatan", status: "DONE", assignee: "Fajar Nugroho", order: 1 },
              { title: "Uji tampilan di HP", status: "DONE", assignee: "Rina Wulandari", order: 2 },
            ] },
          },
        ],
      },
    },
  });

  const toko = await prisma.project.create({
    data: {
      clientId: kopi.id, websiteId: site("belikopinusantara.com"), name: "Pembuatan Website Toko Online",
      description: "Toko online untuk penjualan biji kopi dan paket hampers.",
      type: "NEW_WEBSITE", status: "IN_PROGRESS", startDate: daysFromNow(-30), endDate: daysFromNow(30),
      sprints: {
        create: [
          {
            name: "Sprint 1", goal: "Struktur toko dan katalog produk", startDate: daysFromNow(-30), endDate: daysFromNow(-16), status: "DONE",
            tasks: { create: [
              { title: "Instal WooCommerce dan tema", status: "DONE", assignee: "Fajar Nugroho", order: 0 },
              { title: "Input 24 produk kopi", status: "DONE", assignee: "Rina Wulandari", order: 1 },
              { title: "Atur ongkos kirim per wilayah", status: "DONE", assignee: "Fajar Nugroho", order: 2 },
              { title: "Desain halaman beranda toko", status: "DONE", assignee: "Rina Wulandari", order: 3 },
            ] },
          },
          {
            name: "Sprint 2", goal: "Pembayaran dan uji coba", startDate: daysFromNow(-15), endDate: daysFromNow(0), status: "ACTIVE",
            tasks: { create: [
              { title: "Hubungkan konfirmasi transfer bank", status: "DONE", assignee: "Fajar Nugroho", order: 0 },
              { title: "Perbaiki tampilan checkout di HP", status: "IN_PROGRESS", assignee: "Fajar Nugroho", order: 1 },
              { title: "Buat halaman syarat dan ketentuan", status: "IN_PROGRESS", assignee: "Rina Wulandari", order: 2 },
              { title: "Uji pesanan dari awal sampai selesai", status: "TODO", assignee: "Dimas Ardiansyah", order: 3 },
              { title: "Pelatihan admin toko", status: "TODO", assignee: "Dimas Ardiansyah", order: 4 },
            ] },
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      clientId: batik.id, websiteId: site("batiklaras.com"), name: "Pemeliharaan Website Oktober",
      type: "MAINTENANCE", status: "PLANNING", startDate: daysFromNow(3),
      sprints: {
        create: {
          name: "Sprint 1", goal: "Pembaruan rutin dan pengecekan keamanan", startDate: daysFromNow(3), endDate: daysFromNow(17),
          tasks: { create: [
            { title: "Perbarui paket dependensi", status: "TODO", assignee: "Fajar Nugroho", order: 0 },
            { title: "Cek kecepatan halaman koleksi", status: "TODO", assignee: "Fajar Nugroho", order: 1 },
            { title: "Cadangkan database dan gambar", status: "TODO", assignee: "Dimas Ardiansyah", order: 2 },
          ] },
        },
      },
    },
  });

  const artikel = await prisma.project.create({
    data: {
      clientId: kopi.id, websiteId: site("kopinusantara.co.id"), name: "Penulisan Artikel SEO Agustus",
      type: "CONTENT", status: "DONE", startDate: daysFromNow(-60), endDate: daysFromNow(-25), approvedAt: daysFromNow(-22),
      sprints: {
        create: {
          name: "Sprint 1", goal: "8 artikel tentang kopi", startDate: daysFromNow(-60), endDate: daysFromNow(-25), status: "DONE",
          tasks: { create: [
            { title: "Riset kata kunci", status: "DONE", assignee: "Rina Wulandari", order: 0 },
            { title: "Tulis 8 artikel", status: "DONE", assignee: "Rina Wulandari", order: 1 },
            { title: "Unggah dan atur meta deskripsi", status: "DONE", assignee: "Fajar Nugroho", order: 2 },
          ] },
        },
      },
    },
  });

  const [klinikUser] = klinik.users;
  const [kopiUser] = kopi.users;
  const [batikUser] = batik.users;

  await prisma.message.createMany({
    data: [
      { projectId: redesign.id, senderId: admin.id, body: "Selamat pagi Bu Ayu, desain halaman layanan sudah kami kirim. Mohon dicek.", createdAt: daysFromNow(-30) },
      { projectId: redesign.id, senderId: klinikUser.id, body: "Sudah saya lihat. Tolong tambahkan harga perawatan behel juga ya.", createdAt: daysFromNow(-29) },
      { projectId: redesign.id, senderId: admin.id, body: "Baik, harga behel sudah ditambahkan. Halaman sudah online, silakan disetujui kalau sudah sesuai.", createdAt: daysFromNow(-2) },
      { projectId: toko.id, senderId: kopiUser.id, body: "Pak, untuk pembayaran bisa pakai transfer BCA dan Mandiri?", createdAt: daysFromNow(-10) },
      { projectId: toko.id, senderId: admin.id, body: "Bisa Pak Budi, dua rekening itu sudah kami pasang di halaman checkout.", createdAt: daysFromNow(-9) },
    ],
  });

  const invoiceSeeds = [
    { projectId: artikel.id, status: "PAID", issuedDays: -45, dueDays: -31, paidDays: -35, items: [{ description: "Penulisan artikel SEO", qty: 8, unitPrice: 250000 }] },
    { projectId: redesign.id, status: "OVERDUE", issuedDays: -25, dueDays: -11, items: [
      { description: "Desain ulang halaman layanan", qty: 4, unitPrice: 750000 },
      { description: "Optimasi kecepatan halaman", qty: 1, unitPrice: 1200000 },
    ] },
    { projectId: toko.id, status: "SENT", issuedDays: -5, dueDays: 9, items: [{ description: "Uang muka 50% pembuatan toko online", qty: 1, unitPrice: 6500000 }] },
    { projectId: toko.id, status: "DRAFT", issuedDays: 0, dueDays: 14, items: [
      { description: "Pelunasan pembuatan toko online", qty: 1, unitPrice: 6500000 },
      { description: "Hosting 1 tahun", qty: 1, unitPrice: 1500000 },
    ] },
  ] as const;

  const sequenceByMonth = new Map<string, number>();
  const invoices = [];
  for (const { items, issuedDays, dueDays, ...invoice } of invoiceSeeds) {
    const issuedDate = daysFromNow(issuedDays);
    const wib = new Date(issuedDate.getTime() + WIB_OFFSET);
    const month = `${wib.getUTCFullYear()}/${String(wib.getUTCMonth() + 1).padStart(2, "0")}`;
    const sequence = (sequenceByMonth.get(month) ?? 0) + 1;
    sequenceByMonth.set(month, sequence);
    invoices.push(
      await prisma.invoice.create({
        data: {
          projectId: invoice.projectId,
          status: invoice.status,
          number: `INV/${month}/${String(sequence).padStart(4, "0")}`,
          amount: items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
          issuedDate,
          dueDate: daysFromNow(dueDays),
          paidAt: "paidDays" in invoice ? daysFromNow(invoice.paidDays) : null,
          items: { create: [...items] },
        },
      }),
    );
  }

  const requestSeeds = [
    { client: klinik, user: klinikUser, websiteId: site("senyumsehat.co.id"), type: "ADD_CONTENT", priority: "MEDIUM", status: "IN_REVIEW",
      title: "Tambah artikel promo pemutihan gigi", description: "Mohon dibuatkan artikel promo pemutihan gigi untuk bulan depan, diskon 20%.",
      createdHours: -24, respondedHours: -20 },
    { client: kopi, user: kopiUser, websiteId: site("belikopinusantara.com"), projectId: toko.id, type: "BUG_FIX", priority: "URGENT", status: "SUBMITTED",
      title: "Tombol checkout tidak bisa diklik di HP", description: "Beberapa pembeli melapor tombol checkout tidak merespons saat dibuka dari HP Android.",
      createdHours: -8 },
    { client: kopi, user: kopiUser, websiteId: site("kopinusantara.co.id"), type: "EDIT_CONTENT", priority: "LOW", status: "DONE",
      title: "Ganti nomor WhatsApp di halaman kontak", description: "Nomor WhatsApp lama sudah tidak aktif, mohon diganti ke 0812 9876 5402.",
      createdHours: -12 * 24, respondedHours: -11 * 24, resolvedHours: -10 * 24,
      adminResponse: "Nomor WhatsApp sudah diganti di halaman kontak dan di bagian bawah semua halaman." },
    { client: batik, user: batikUser, websiteId: site("batiklaras.com"), type: "DESIGN_REVISION", priority: "HIGH", status: "IN_PROGRESS",
      title: "Ganti foto banner koleksi terbaru", description: "Foto banner diganti dengan koleksi batik kerja terbaru. Foto ada di tautan Google Drive.",
      referenceUrl: "https://drive.google.com/drive/folders/batik-laras-banner-oktober",
      createdHours: -48, respondedHours: -40, adminResponse: "Sedang kami kerjakan, perkiraan selesai besok." },
    { client: klinik, user: klinikUser, websiteId: site("senyumsehat.co.id"), type: "NEW_FEATURE", priority: "MEDIUM", status: "REJECTED",
      title: "Tambah fitur booking jadwal dokter", description: "Pasien ingin bisa memilih jadwal dokter langsung dari website.",
      createdHours: -6 * 24, respondedHours: -5 * 24,
      rejectionReason: "Fitur booking online di luar paket pemeliharaan. Penawaran terpisah sudah kami kirim lewat email." },
    { client: batik, user: batikUser, websiteId: site("batiklaras.com"), type: "OTHER", priority: "LOW", status: "APPROVED",
      title: "Tambah akun email untuk admin toko", description: "Mohon dibuatkan email admin@batiklaras.com untuk staf toko.",
      createdHours: -72, respondedHours: -50, adminResponse: "Disetujui, akan kami buatkan minggu ini." },
  ] as const;

  const requests = [];
  for (const { client, user, createdHours, ...request } of requestSeeds) {
    requests.push(
      await prisma.slaRequest.create({
        data: {
          clientId: client.id,
          createdById: user.id,
          websiteId: request.websiteId,
          projectId: "projectId" in request ? request.projectId : null,
          type: request.type,
          priority: request.priority,
          status: request.status,
          title: request.title,
          description: request.description,
          referenceUrl: "referenceUrl" in request ? request.referenceUrl : null,
          adminResponse: "adminResponse" in request ? request.adminResponse : null,
          rejectionReason: "rejectionReason" in request ? request.rejectionReason : null,
          createdAt: hoursFromNow(createdHours),
          dueAt: hoursFromNow(createdHours + SLA_HOURS[request.priority]),
          respondedAt: "respondedHours" in request ? hoursFromNow(request.respondedHours) : null,
          resolvedAt: "resolvedHours" in request ? hoursFromNow(request.resolvedHours) : null,
        },
      }),
    );
  }

  await prisma.notification.createMany({
    data: [
      { userId: admin.id, type: "NEW_REQUEST", title: "Permintaan baru", body: `${kopi.company}: ${requests[1].title}`, createdAt: hoursFromNow(-8) },
      { userId: klinikUser.id, type: "WAITING_APPROVAL", title: "Proyek menunggu persetujuan", body: `${redesign.name} sudah selesai dan menunggu persetujuan Anda.`, link: `/portal/projects/${redesign.id}`, createdAt: daysFromNow(-2) },
      { userId: kopiUser.id, type: "INVOICE_SENT", title: "Invoice baru", body: `Invoice ${invoices[2].number} sudah dikirim.`, createdAt: daysFromNow(-5) },
    ],
  });
}

main()
  .then(() => console.info("Seed selesai."))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
