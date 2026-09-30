import { Prisma, type InvoiceStatus } from "@prisma/client";

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const INVOICE_DUE_DAYS = 14;

// Klien tidak pernah melihat invoice DRAFT atau yang dibatalkan (PRD 6.4).
export const CLIENT_VISIBLE_INVOICE_STATUSES: InvoiceStatus[] = ["SENT", "PAID", "OVERDUE"];

// Nomor invoice: INV/{YYYY}/{MM}/{urutan 4 digit per bulan}; bulan dihitung dalam WIB.
export function invoicePrefix(issuedDate: Date): string {
  const wib = new Date(issuedDate.getTime() + WIB_OFFSET_MS);
  const month = String(wib.getUTCMonth() + 1).padStart(2, "0");
  return `INV/${wib.getUTCFullYear()}/${month}/`;
}

export function formatInvoiceNumber(issuedDate: Date, sequence: number): string {
  return `${invoicePrefix(issuedDate)}${String(sequence).padStart(4, "0")}`;
}

export function nextInvoiceNumber(lastNumber: string | null, issuedDate: Date): string {
  const lastSequence = lastNumber ? Number(lastNumber.slice(lastNumber.lastIndexOf("/") + 1)) : 0;
  return formatInvoiceNumber(issuedDate, lastSequence + 1);
}

// Dua invoice yang dibuat bersamaan bisa mendapat nomor sama; pemanggil harus mengulang bila terjadi error unik (P2002).
export async function generateInvoiceNumber(db: Prisma.TransactionClient, issuedDate: Date): Promise<string> {
  const last = await db.invoice.findFirst({
    where: { number: { startsWith: invoicePrefix(issuedDate) } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  return nextInvoiceNumber(last?.number ?? null, issuedDate);
}

// Total selalu dihitung ulang di server dari item, tidak pernah dari nilai kiriman browser.
export function calculateInvoiceTotal(items: { qty: number; unitPrice: Prisma.Decimal.Value }[]): Prisma.Decimal {
  return items.reduce(
    (total, item) => total.plus(new Prisma.Decimal(item.unitPrice).times(item.qty)),
    new Prisma.Decimal(0),
  );
}

// Jatuh tempo 14 Okt berarti masih boleh dibayar sepanjang 14 Okt; terlambat mulai 15 Okt 00:00 WIB.
export function isPastDue(dueDate: Date, now: Date = new Date()): boolean {
  return now.getTime() >= dueDate.getTime() + DAY_MS;
}

// SENT yang lewat jatuh tempo ditampilkan sebagai OVERDUE walau cron harian belum berjalan (PRD 6.4).
export function effectiveInvoiceStatus(invoice: { status: InvoiceStatus; dueDate: Date }, now: Date = new Date()): InvoiceStatus {
  return invoice.status === "SENT" && isPastDue(invoice.dueDate, now) ? "OVERDUE" : invoice.status;
}

export type InvoiceAction = "send" | "mark-paid" | "cancel";

const INVOICE_ACTIONS: Record<InvoiceAction, { from: InvoiceStatus[]; to: InvoiceStatus }> = {
  send: { from: ["DRAFT"], to: "SENT" },
  "mark-paid": { from: ["SENT", "OVERDUE"], to: "PAID" },
  cancel: { from: ["DRAFT", "SENT", "OVERDUE"], to: "CANCELLED" },
};

export function canApplyInvoiceAction(status: InvoiceStatus, action: InvoiceAction): boolean {
  return INVOICE_ACTIONS[action].from.includes(status);
}

export function invoiceActionTarget(action: InvoiceAction): InvoiceStatus {
  return INVOICE_ACTIONS[action].to;
}
