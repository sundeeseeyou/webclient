import type { Prisma } from "@prisma/client";
import { fail, isUniqueViolation, notFound, ok } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import {
  canApplyInvoiceAction,
  effectiveInvoiceStatus,
  generateInvoiceNumber,
  type InvoiceAction,
  invoiceActionTarget,
  isPastDue,
} from "@/lib/invoice";
import { notifyClientUsers } from "@/lib/notify";
import { prisma } from "@/lib/prisma";

const NUMBER_ATTEMPTS = 3;

export const NUMBER_CONFLICT_MESSAGE = "Nomor invoice sedang dipakai penyimpanan lain. Silakan simpan ulang.";

/*
 * Nomor dibuat dari invoice terakhir di bulan yang sama. Dua admin yang menyimpan bersamaan bisa
 * mendapat nomor sama; yang kalah terkena error unik (P2002) lalu transaksinya diulang dengan nomor berikutnya.
 * Mengembalikan null bila tetap bentrok setelah beberapa kali percobaan.
 */
export async function withInvoiceNumber<T>(
  issuedDate: Date,
  write: (tx: Prisma.TransactionClient, number: string) => Promise<T>,
): Promise<T | null> {
  for (let attempt = 1; attempt <= NUMBER_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => write(tx, await generateInvoiceNumber(tx, issuedDate)));
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  return null;
}

const rejectedActionMessages: Record<InvoiceAction, string> = {
  send: "Hanya invoice berstatus Draf yang bisa dikirim ke klien.",
  "mark-paid": "Hanya invoice yang sudah dikirim dan belum lunas yang bisa ditandai lunas.",
  cancel: "Invoice yang sudah lunas atau sudah dibatalkan tidak bisa dibatalkan.",
};

export async function applyInvoiceAction(id: string, action: InvoiceAction) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { id: true, number: true, amount: true, status: true, dueDate: true, project: { select: { clientId: true } } },
  });
  if (!invoice) return notFound();

  if (!canApplyInvoiceAction(effectiveInvoiceStatus(invoice), action)) return fail(rejectedActionMessages[action]);
  // Invoice yang dikirim setelah jatuh tempo langsung berstatus terlambat di portal klien.
  if (action === "send" && isPastDue(invoice.dueDate)) {
    return fail("Tanggal jatuh tempo sudah lewat. Ubah jatuh tempo invoice ini sebelum mengirimnya.");
  }

  const status = invoiceActionTarget(action);
  // Status lama ikut disaring agar dua klik bersamaan tidak memproses (dan mengirim notifikasi) dua kali.
  const { count } = await prisma.invoice.updateMany({
    where: { id, status: invoice.status },
    data: { status, ...(action === "mark-paid" && { paidAt: new Date() }) },
  });
  if (count === 0) return fail("Status invoice baru saja berubah. Muat ulang halaman lalu coba lagi.", 409);

  if (action === "send") {
    await notifyClientUsers(invoice.project.clientId, {
      type: "INVOICE_SENT",
      title: "Invoice baru",
      body: `Invoice ${invoice.number} sebesar ${formatRupiah(invoice.amount)} sudah dikirim.`,
      link: "/portal/invoices",
    });
  }
  return ok({ id, status });
}
