import { NextResponse, type NextRequest } from "next/server";
import { fail, ok, parseBody } from "@/lib/api";
import { parseDateInput } from "@/lib/dates";
import { calculateInvoiceTotal } from "@/lib/invoice";
import { invoiceAccessWhere, listInvoices, parseInvoiceFilter } from "@/lib/invoice-queries";
import { NUMBER_CONFLICT_MESSAGE, withInvoiceNumber } from "@/lib/invoice-writes";
import { prisma } from "@/lib/prisma";
import { invalidField } from "@/lib/projects";
import { requireApiUser } from "@/lib/rbac";
import { invoiceSchema } from "@/lib/validations/invoice";

export async function GET(request: NextRequest) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  // Filter dari URL hanya berlaku untuk admin; klien selalu dibatasi invoice miliknya yang sudah dikirim.
  if (user.role === "CLIENT") return ok(await listInvoices(invoiceAccessWhere(user)));

  const params = request.nextUrl.searchParams;
  const clientId = params.get("clientId");
  return ok(await listInvoices(clientId ? { project: { clientId } } : {}, parseInvoiceFilter(params.get("status"))));
}

export async function POST(request: Request) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const body = await parseBody(request, invoiceSchema);
  if (body.response) return body.response;
  const { projectId, issuedDate, dueDate, notes, items } = body.data;

  const project = await prisma.project.findFirst({ where: { id: projectId, client: { isActive: true } }, select: { id: true } });
  if (!project) return invalidField("projectId", "Proyek tidak ditemukan atau kliennya sudah nonaktif");

  const issued = parseDateInput(issuedDate);
  const invoice = await withInvoiceNumber(issued, (tx, number) =>
    tx.invoice.create({
      data: {
        projectId,
        number,
        status: "DRAFT",
        issuedDate: issued,
        dueDate: parseDateInput(dueDate),
        notes,
        // Total selalu dihitung dari item; nilai amount kiriman browser diabaikan.
        amount: calculateInvoiceTotal(items),
        items: { create: items },
      },
      select: { id: true, number: true, amount: true },
    }),
  );
  if (!invoice) return fail(NUMBER_CONFLICT_MESSAGE, 409);
  return ok({ ...invoice, amount: Number(invoice.amount) }, 201);
}
