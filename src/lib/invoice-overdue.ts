import { isPastDue } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";

// Invoice SENT yang lewat jatuh tempo diubah menjadi OVERDUE. Aman dijalankan berulang karena hanya menyentuh status SENT.
export async function markOverdueInvoices(now: Date = new Date()): Promise<number> {
  const sent = await prisma.invoice.findMany({
    where: { status: "SENT", dueDate: { lt: now } },
    select: { id: true, dueDate: true },
  });
  const overdueIds = sent.filter((invoice) => isPastDue(invoice.dueDate, now)).map((invoice) => invoice.id);
  if (overdueIds.length === 0) return 0;

  const { count } = await prisma.invoice.updateMany({
    where: { id: { in: overdueIds }, status: "SENT" },
    data: { status: "OVERDUE" },
  });
  return count;
}
