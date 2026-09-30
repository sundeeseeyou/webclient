import type { InvoiceStatus, ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { RENEWAL_WARNING_DAYS } from "@/lib/renewal";
import { isOverdue, overdueWhere } from "@/lib/sla";

const DAY_MS = 24 * 60 * 60 * 1000;

// Proyek yang masih dikerjakan atau menunggu klien; Selesai dan Ditunda tidak dihitung sebagai berjalan.
const RUNNING_PROJECT_STATUSES: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "WAITING_APPROVAL", "REVISION"];

// Belum lunas = sudah dikirim ke klien tapi belum dibayar, termasuk yang lewat jatuh tempo.
const UNPAID_INVOICE_STATUSES: InvoiceStatus[] = ["SENT", "OVERDUE"];

// Daftar perpanjangan memberi waktu persiapan lebih panjang (60 hari) daripada kartu ringkasan (30 hari).
export const RENEWAL_LIST_DAYS = 60;

export type RenewalKind = "domain" | "hosting";

export type UpcomingRenewal = {
  websiteId: string;
  domain: string;
  kind: RenewalKind;
  date: Date;
};

type RenewalWebsite = { id: string; domain: string; domainRenewAt: Date | null; hostingRenewAt: Date | null };

function toRenewals(websites: RenewalWebsite[], limit: Date): UpcomingRenewal[] {
  return websites
    .flatMap((website) => [
      { websiteId: website.id, domain: website.domain, kind: "domain" as const, date: website.domainRenewAt },
      { websiteId: website.id, domain: website.domain, kind: "hosting" as const, date: website.hostingRenewAt },
    ])
    .filter((renewal): renewal is UpcomingRenewal => renewal.date !== null && renewal.date <= limit)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getAdminDashboard(now: Date = new Date()) {
  const warningLimit = new Date(now.getTime() + RENEWAL_WARNING_DAYS * DAY_MS);
  const listLimit = new Date(now.getTime() + RENEWAL_LIST_DAYS * DAY_MS);

  const [activeClients, runningProjects, newRequests, overdueRequests, unpaid, renewalWebsites, recentRequests] =
    await Promise.all([
      prisma.client.count({ where: { isActive: true } }),
      prisma.project.count({ where: { status: { in: RUNNING_PROJECT_STATUSES } } }),
      prisma.slaRequest.count({ where: { status: "SUBMITTED" } }),
      prisma.slaRequest.count({ where: overdueWhere(now) }),
      prisma.invoice.aggregate({
        where: { status: { in: UNPAID_INVOICE_STATUSES } },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      // Sama dengan cron pengingat: hanya website milik klien aktif. Tanggal yang sudah lewat tetap ikut.
      prisma.website.findMany({
        where: {
          client: { isActive: true },
          OR: [{ domainRenewAt: { lte: listLimit } }, { hostingRenewAt: { lte: listLimit } }],
        },
        select: { id: true, domain: true, domainRenewAt: true, hostingRenewAt: true },
      }),
      prisma.slaRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          dueAt: true,
          respondedAt: true,
          client: { select: { company: true } },
          website: { select: { domain: true } },
        },
      }),
    ]);

  const renewals = toRenewals(renewalWebsites, listLimit);
  const expiringWebsites = new Set(renewals.filter((renewal) => renewal.date <= warningLimit).map((renewal) => renewal.websiteId));

  return {
    summary: {
      activeClients,
      runningProjects,
      newRequests,
      overdueRequests,
      unpaidInvoices: { count: unpaid._count._all, total: unpaid._sum.amount ?? 0 },
      expiringWebsites: expiringWebsites.size,
    },
    recentRequests: recentRequests.map(({ dueAt, respondedAt, ...request }) => ({
      ...request,
      overdue: isOverdue({ dueAt, respondedAt }, now),
    })),
    renewals,
  };
}

type AdminDashboard = Awaited<ReturnType<typeof getAdminDashboard>>;
export type AdminSummary = AdminDashboard["summary"];
export type RecentRequest = AdminDashboard["recentRequests"][number];
