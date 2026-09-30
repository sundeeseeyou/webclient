import { NextResponse } from "next/server";
import { fail, notFound, ok } from "@/lib/api";
import { syncWordPressArticles, WordPressSyncError } from "@/lib/integrations/wordpress";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";

export async function POST(_request: Request, ctx: RouteContext<"/api/websites/[id]/sync-wordpress">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const website = await prisma.website.findUnique({ where: { id }, select: { id: true, wpApiUrl: true } });
  if (!website) return notFound();
  if (!website.wpApiUrl) return fail("Alamat API WordPress belum diisi. Lengkapi dulu lewat tombol Ubah.");

  try {
    const synced = await syncWordPressArticles(website.id, website.wpApiUrl);
    return ok({ synced });
  } catch (error) {
    // 502: kesalahan ada di situs WordPress klien, bukan di aplikasi ini.
    if (error instanceof WordPressSyncError) return fail(error.message, 502);
    throw error;
  }
}
