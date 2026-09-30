import { NextResponse } from "next/server";
import { notFound, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { clientScope, requireApiUser } from "@/lib/rbac";
import { isOverdue } from "@/lib/sla";

export async function GET(_request: Request, ctx: RouteContext<"/api/requests/[id]">) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  // Permintaan klien lain dicari dengan filter clientId dari session, sehingga hasilnya 404.
  const request = await prisma.slaRequest.findFirst({
    where: { id, ...clientScope(user) },
    include: {
      client: { select: { id: true, company: true } },
      website: { select: { id: true, domain: true } },
      project: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
    },
  });
  if (!request) return notFound();

  return ok({ ...request, overdue: isOverdue(request) });
}
