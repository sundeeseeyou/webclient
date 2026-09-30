import { InvoiceStatus, type Prisma } from "@prisma/client";
import { CLIENT_VISIBLE_INVOICE_STATUSES, effectiveInvoiceStatus } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/rbac";

// "Belum lunas" = invoice yang sudah dikirim tapi belum dibayar, termasuk yang lewat jatuh tempo.
export const UNPAID_FILTER = "unpaid";
export type InvoiceFilter = InvoiceStatus | typeof UNPAID_FILTER;

const UNPAID_STATUSES: InvoiceStatus[] = ["SENT", "OVERDUE"];

// Nilai filter dari URL bisa berisi apa saja, jadi hanya nilai yang dikenal yang dipakai.
export function parseInvoiceFilter(value: unknown): InvoiceFilter | undefined {
  if (value === UNPAID_FILTER) return UNPAID_FILTER;
  return Object.values(InvoiceStatus).find((status) => status === value);
}

// Klien hanya melihat invoice proyek miliknya yang sudah dikirim; DRAFT dan CANCELLED dianggap tidak ada (404).
export function invoiceAccessWhere(user: SessionUser): Prisma.InvoiceWhereInput {
  return user.role === "CLIENT"
    ? { project: { clientId: user.clientId }, status: { in: CLIENT_VISIBLE_INVOICE_STATUSES } }
    : {};
}

// SENT yang lewat jatuh tempo tersimpan sebagai SENT sampai cron berjalan, jadi filter SENT/OVERDUE mengambil keduanya lalu disaring ulang.
function storedStatusesFor(filter: InvoiceFilter): InvoiceStatus[] {
  return filter === UNPAID_FILTER || filter === "SENT" || filter === "OVERDUE" ? UNPAID_STATUSES : [filter];
}

function matchesFilter(status: InvoiceStatus, filter: InvoiceFilter): boolean {
  return filter === UNPAID_FILTER ? UNPAID_STATUSES.includes(status) : status === filter;
}

const invoiceListSelect = {
  id: true,
  number: true,
  amount: true,
  status: true,
  issuedDate: true,
  dueDate: true,
  paidAt: true,
  project: { select: { id: true, name: true, client: { select: { id: true, company: true } } } },
} satisfies Prisma.InvoiceSelect;

// Kolom `status` di hasil sudah berupa status efektif (SENT yang lewat jatuh tempo menjadi OVERDUE).
export async function listInvoices(where: Prisma.InvoiceWhereInput, filter?: InvoiceFilter, now: Date = new Date()) {
  const invoices = await prisma.invoice.findMany({
    where: filter ? { AND: [where, { status: { in: storedStatusesFor(filter) } }] } : where,
    select: invoiceListSelect,
    // Nomor mengikuti bulan terbit lalu urutan pembuatan, jadi urutan nomor = urutan terbaru.
    orderBy: { number: "desc" },
  });
  return invoices
    .map((invoice) => ({ ...invoice, amount: Number(invoice.amount), status: effectiveInvoiceStatus(invoice, now) }))
    .filter((invoice) => !filter || matchesFilter(invoice.status, filter));
}

export type InvoiceListItem = Awaited<ReturnType<typeof listInvoices>>[number];

const invoiceDetailInclude = {
  // cuid bertambah sesuai urutan pembuatan, jadi urutan id = urutan item saat diisi.
  items: { orderBy: { id: "asc" } },
  project: {
    select: {
      id: true,
      name: true,
      website: { select: { id: true, domain: true } },
      client: { select: { id: true, company: true, name: true, email: true, phone: true, address: true } },
    },
  },
} satisfies Prisma.InvoiceInclude;

export async function getInvoiceDetail(id: string, user: SessionUser, now: Date = new Date()) {
  const invoice = await prisma.invoice.findFirst({ where: { id, ...invoiceAccessWhere(user) }, include: invoiceDetailInclude });
  if (!invoice) return null;
  return {
    ...invoice,
    amount: Number(invoice.amount),
    status: effectiveInvoiceStatus(invoice, now),
    items: invoice.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice) })),
  };
}

export type InvoiceDetail = NonNullable<Awaited<ReturnType<typeof getInvoiceDetail>>>;
