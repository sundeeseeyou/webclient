import { NextResponse } from "next/server";
import { fail, isUniqueViolation, notFound, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { clientScope, requireApiUser } from "@/lib/rbac";
import { domainTakenResponse, toWebsiteData } from "@/lib/website-data";
import { websiteSchema } from "@/lib/validations/website";

export async function GET(_request: Request, ctx: RouteContext<"/api/websites/[id]">) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  // Website milik klien lain dianggap tidak ada (404), bukan 403.
  const website = await prisma.website.findFirst({
    where: { id, ...clientScope(user) },
    include: {
      client: { select: { id: true, company: true } },
      stats: { orderBy: { period: "desc" } },
      _count: { select: { articles: { where: { status: "PUBLISHED" } } } },
    },
  });
  if (!website) return notFound();
  return ok(website);
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/websites/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const existing = await prisma.website.findUnique({ where: { id }, select: { clientId: true } });
  if (!existing) return notFound();

  const body = await parseBody(request, websiteSchema);
  if (body.response) return body.response;

  // Pemilik lama tetap boleh dipertahankan walaupun kliennya sudah nonaktif.
  if (body.data.clientId !== existing.clientId) {
    const client = await prisma.client.findFirst({ where: { id: body.data.clientId, isActive: true }, select: { id: true } });
    if (!client) return fail("Periksa kembali isian Anda.", 400, { clientId: "Klien tidak ditemukan atau sudah nonaktif" });
  }

  try {
    const website = await prisma.website.update({ where: { id }, data: toWebsiteData(body.data) });
    return ok(website);
  } catch (error) {
    if (isUniqueViolation(error)) return domainTakenResponse();
    throw error;
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/websites/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const existing = await prisma.website.findUnique({ where: { id }, select: { id: true, clientId: true } });
  if (!existing) return notFound();

  // Statistik dan artikel ikut terhapus (cascade); proyek & permintaan tetap ada tanpa website.
  await prisma.website.delete({ where: { id } });
  return ok(existing);
}
