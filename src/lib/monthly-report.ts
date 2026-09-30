import type { Prisma } from "@prisma/client";
import { parseMonthInput, startOfMonthWib, toMonthInputValue } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { progressSelect, projectProgress } from "@/lib/progress";

const longMonthFormatter = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

// "September 2026"
function formatMonthLong(date: Date): string {
  return longMonthFormatter.format(date);
}

export type MonthOption = { value: string; label: string };

const REPORT_MONTH_OPTIONS = 12;

// Pilihan bulan laporan: bulan berjalan dan 11 bulan sebelumnya (WIB), yang terbaru di atas.
export function reportMonthOptions(now: Date = new Date()): MonthOption[] {
  return Array.from({ length: REPORT_MONTH_OPTIONS }, (_, index) => {
    const period = startOfMonthWib(now, -index);
    return { value: toMonthInputValue(period), label: formatMonthLong(period) };
  });
}

// Bawaan bulan lalu, karena data bulan berjalan belum lengkap.
export function defaultReportMonth(now: Date = new Date()): string {
  return toMonthInputValue(startOfMonthWib(now, -1));
}

export function reportFilename(domain: string, month: string): string {
  return `Laporan-${domain}-${month}`;
}

// `where` wajib sudah memuat filter clientId dari session untuk klien, sehingga website klien lain menghasilkan null (404).
export async function getMonthlyReport(where: Prisma.WebsiteWhereInput, month: string) {
  // Batas bulan dihitung dalam WIB: tanggal 1 pukul 00:00 WIB sampai tanggal 1 bulan berikutnya.
  const start = parseMonthInput(month);
  const end = startOfMonthWib(start, 1);
  const previousStart = startOfMonthWib(start, -1);

  const website = await prisma.website.findFirst({
    where,
    select: {
      id: true,
      clientId: true,
      domain: true,
      hostingProvider: true,
      domainRenewAt: true,
      hostingRenewAt: true,
      client: { select: { company: true } },
      stats: { where: { period: { gte: previousStart, lt: end } }, select: { period: true, visitors: true, pageviews: true } },
      articles: {
        where: { status: "PUBLISHED", publishedAt: { gte: start, lt: end } },
        orderBy: [{ publishedAt: "asc" }, { title: "asc" }],
        select: { id: true, title: true, publishedAt: true },
      },
    },
  });
  if (!website) return null;

  // Permintaan dan proyek dibatasi ke klien pemilik website sekarang, karena website bisa dipindah ke klien lain.
  const [requests, projects] = await Promise.all([
    prisma.slaRequest.findMany({
      where: {
        clientId: website.clientId,
        status: "DONE",
        resolvedAt: { gte: start, lt: end },
        OR: [{ websiteId: website.id }, { project: { websiteId: website.id } }],
      },
      orderBy: { resolvedAt: "asc" },
      select: { id: true, title: true, type: true, resolvedAt: true },
    }),
    prisma.project.findMany({
      where: { clientId: website.clientId, websiteId: website.id, status: { not: "DONE" } },
      orderBy: { startDate: "desc" },
      select: { id: true, name: true, status: true, ...progressSelect },
    }),
  ]);

  const statFor = (period: Date) => {
    const stat = website.stats.find((row) => toMonthInputValue(row.period) === toMonthInputValue(period));
    return stat ? { visitors: stat.visitors, pageviews: stat.pageviews } : null;
  };

  return {
    month,
    periodLabel: formatMonthLong(start),
    previousLabel: formatMonthLong(previousStart),
    company: website.client.company,
    website: {
      domain: website.domain,
      hostingProvider: website.hostingProvider,
      domainRenewAt: website.domainRenewAt,
      hostingRenewAt: website.hostingRenewAt,
    },
    traffic: { current: statFor(start), previous: statFor(previousStart) },
    articles: website.articles,
    requests,
    projects: projects.map(({ sprints, ...project }) => ({ ...project, progress: projectProgress({ sprints }) })),
  };
}

export type MonthlyReport = NonNullable<Awaited<ReturnType<typeof getMonthlyReport>>>;
