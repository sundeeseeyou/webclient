import { NextResponse } from "next/server";
import { notFound, ok, parseBody } from "@/lib/api";
import { parseMonthInput } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { websiteStatSchema } from "@/lib/validations/website";

// Satu baris statistik per website per bulan: input ulang untuk bulan yang sama menimpa angka sebelumnya.
export async function PUT(request: Request, ctx: RouteContext<"/api/websites/[id]/stats">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const website = await prisma.website.findUnique({ where: { id }, select: { id: true } });
  if (!website) return notFound();

  const body = await parseBody(request, websiteStatSchema);
  if (body.response) return body.response;

  const { month, visitors, pageviews } = body.data;
  const period = parseMonthInput(month);
  const stat = await prisma.websiteStat.upsert({
    where: { websiteId_period: { websiteId: id, period } },
    create: { websiteId: id, period, visitors, pageviews, source: "MANUAL" },
    update: { visitors, pageviews, source: "MANUAL" },
  });
  return ok(stat);
}
