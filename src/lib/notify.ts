import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "NEW_MESSAGE"
  | "NEW_REQUEST"
  | "REQUEST_UPDATED"
  | "INVOICE_SENT"
  | "WAITING_APPROVAL"
  | "RENEWAL_REMINDER";

export type NotificationInput = {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  dedupeKey?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationSummary = {
  unreadCount: number;
  items: NotificationItem[];
};

export async function notifyUsers(userIds: string[], input: NotificationInput): Promise<void> {
  // dedupeKey unik per baris, jadi ditambah id user; penerima yang sudah punya notifikasi yang sama dilewati.
  const keyFor = (userId: string) => (input.dedupeKey ? `${input.dedupeKey}:${userId}` : null);
  let recipients = [...new Set(userIds)];
  if (input.dedupeKey && recipients.length > 0) {
    const existing = await prisma.notification.findMany({
      where: { dedupeKey: { in: recipients.map((id) => `${input.dedupeKey}:${id}`) } },
      select: { userId: true },
    });
    const notified = new Set(existing.map((row) => row.userId));
    recipients = recipients.filter((id) => !notified.has(id));
  }
  if (recipients.length === 0) return;

  await prisma.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
      dedupeKey: keyFor(userId),
    })),
    skipDuplicates: true,
  });
  await sendEmails(recipients, input);
}

export async function notifyAdmins(input: NotificationInput): Promise<void> {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await notifyUsers(
    admins.map((admin) => admin.id),
    input,
  );
}

export async function notifyClientUsers(clientId: string, input: NotificationInput): Promise<void> {
  const users = await prisma.user.findMany({ where: { clientId }, select: { id: true } });
  await notifyUsers(
    users.map((user) => user.id),
    input,
  );
}

export async function getNotificationSummary(userId: string): Promise<NotificationSummary> {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return {
    unreadCount,
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      link: item.link,
      readAt: item.readAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

// Email bersifat opsional: tanpa RESEND_API_KEY cukup notifikasi di aplikasi. Gagal kirim email tidak membatalkan notifikasi.
async function sendEmails(userIds: string[], input: NotificationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return;

  try {
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { email: true } });
    const link = input.link ? `\n\nBuka: ${process.env.APP_URL ?? ""}${input.link}` : "";
    const results = await Promise.allSettled(
      users.map((user) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: [user.email], subject: input.title, text: `${input.body}${link}` }),
        }),
      ),
    );
    const failed = results.filter((result) => result.status === "rejected" || !result.value.ok).length;
    if (failed > 0) console.error(`Gagal mengirim ${failed} email notifikasi "${input.title}".`);
  } catch (error) {
    console.error("Gagal mengirim email notifikasi.", error);
  }
}
