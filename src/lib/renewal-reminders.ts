import { daysUntil, toDateInputValue } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { notifyUsers } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { RENEWAL_DANGER_DAYS, RENEWAL_WARNING_DAYS, renewalText } from "@/lib/renewal";

type RenewalKind = "domain" | "hosting";

export type RenewalReminderResult = { due: number; created: number };

const kindLabels: Record<RenewalKind, string> = { domain: "Domain", hosting: "Hosting" };

// Pengingat dikirim sekali di tahap 30 hari dan sekali lagi di tahap 7 hari (termasuk yang sudah lewat).
function reminderStage(days: number): 30 | 7 | null {
  if (days <= RENEWAL_DANGER_DAYS) return 7;
  if (days <= RENEWAL_WARNING_DAYS) return 30;
  return null;
}

export async function sendRenewalReminders(now: Date = new Date()): Promise<RenewalReminderResult> {
  const [admins, websites] = await Promise.all([
    prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } }),
    prisma.website.findMany({
      where: { client: { isActive: true } },
      select: {
        id: true,
        domain: true,
        domainRenewAt: true,
        hostingRenewAt: true,
        client: { select: { users: { select: { id: true } } } },
      },
    }),
  ]);
  const adminIds = admins.map((admin) => admin.id);
  const countReminders = () => prisma.notification.count({ where: { type: "RENEWAL_REMINDER" } });
  const before = await countReminders();

  let due = 0;
  for (const website of websites) {
    const clientUserIds = website.client.users.map((user) => user.id);
    const renewals: [RenewalKind, Date | null][] = [
      ["domain", website.domainRenewAt],
      ["hosting", website.hostingRenewAt],
    ];
    for (const [kind, renewAt] of renewals) {
      if (!renewAt) continue;
      const days = daysUntil(renewAt, now);
      const stage = reminderStage(days);
      if (!stage) continue;
      due += 1;

      // Tanggal perpanjangan ikut di kunci, supaya setelah diperpanjang tahun depan pengingat bisa terkirim lagi.
      const dedupeKey = `renew:${website.id}:${kind}:${stage}:${toDateInputValue(renewAt)}`;
      const notification = {
        type: "RENEWAL_REMINDER" as const,
        title: days < 0 ? `Masa aktif ${kind} sudah lewat` : `${kindLabels[kind]} segera habis`,
        body: `${kindLabels[kind]} ${website.domain}: ${renewalText(days).toLowerCase()} (${formatDate(renewAt)}).`,
        dedupeKey,
      };
      // Link admin dan klien berbeda, jadi dikirim terpisah per peran.
      await notifyUsers(adminIds, { ...notification, link: `/admin/websites/${website.id}` });
      await notifyUsers(clientUserIds, { ...notification, link: `/portal/websites/${website.id}` });
    }
  }

  return { due, created: (await countReminders()) - before };
}
