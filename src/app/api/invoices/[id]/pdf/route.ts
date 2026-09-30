import { NextResponse } from "next/server";
import { createElement } from "react";
import { notFound } from "@/lib/api";
import { getInvoiceDetail } from "@/lib/invoice-queries";
import { InvoiceDocument } from "@/lib/pdf/invoice-pdf";
import { pdfResponse } from "@/lib/pdf/response";
import { requireApiUser } from "@/lib/rbac";

export async function GET(_request: Request, ctx: RouteContext<"/api/invoices/[id]/pdf">) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  // Aturan akses sama dengan detail: invoice klien lain atau yang belum dikirim → 404.
  const invoice = await getInvoiceDetail(id, user);
  if (!invoice) return notFound();

  return pdfResponse(createElement(InvoiceDocument, { invoice }), `Invoice ${invoice.number}`);
}
