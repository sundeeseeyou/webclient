import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { fail, notFound, ok, parseBody } from "@/lib/api";
import { parseDateInput } from "@/lib/dates";
import { calculateInvoiceTotal, invoicePrefix } from "@/lib/invoice";
import { getInvoiceDetail } from "@/lib/invoice-queries";
import { NUMBER_CONFLICT_MESSAGE, withInvoiceNumber } from "@/lib/invoice-writes";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { invoiceUpdateSchema } from "@/lib/validations/invoice";

const SENT_LOCKED_MESSAGE = "Invoice yang sudah dikirim tidak bisa diubah.";

export async function GET(_request: Request, ctx: RouteContext<"/api/invoices/[id]">) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const invoice = await getInvoiceDetail(id, user);
  return invoice ? ok(invoice) : notFound();
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/invoices/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const body = await parseBody(request, invoiceUpdateSchema);
  if (body.response) return body.response;

  const existing = await prisma.invoice.findUnique({ where: { id }, select: { number: true, status: true } });
  if (!existing) return notFound();
  if (existing.status !== "DRAFT") {
    return fail(existing.status === "CANCELLED" ? "Invoice yang sudah dibatalkan tidak bisa diubah." : SENT_LOCKED_MESSAGE);
  }

  const { issuedDate, dueDate, notes, items } = body.data;
  const issued = parseDateInput(issuedDate);
  const save = async (tx: Prisma.TransactionClient, number: string) => {
    // Status DRAFT ikut disaring agar invoice yang baru saja dikirim di tab lain tidak ikut berubah.
    const { count } = await tx.invoice.updateMany({
      where: { id, status: "DRAFT" },
      data: { number, issuedDate: issued, dueDate: parseDateInput(dueDate), notes, amount: calculateInvoiceTotal(items) },
    });
    if (count === 0) return false;
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await tx.invoiceItem.createMany({ data: items.map((item) => ({ ...item, invoiceId: id })) });
    return true;
  };

  // Nomor mengikuti bulan tanggal terbit, jadi dibuat ulang bila bulan terbit draf dipindah.
  const saved = existing.number.startsWith(invoicePrefix(issued))
    ? await prisma.$transaction((tx) => save(tx, existing.number))
    : await withInvoiceNumber(issued, save);
  if (saved === null) return fail(NUMBER_CONFLICT_MESSAGE, 409);
  if (!saved) return fail(SENT_LOCKED_MESSAGE);
  return ok({ id });
}
