import { NextResponse } from "next/server";
import { applyInvoiceAction } from "@/lib/invoice-writes";
import { requireApiUser } from "@/lib/rbac";

export async function POST(_request: Request, ctx: RouteContext<"/api/invoices/[id]/mark-paid">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  return applyInvoiceAction(id, "mark-paid");
}
