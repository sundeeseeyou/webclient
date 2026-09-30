import { NextResponse } from "next/server";
import { notFound, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { clientScope, requireApiUser } from "@/lib/rbac";
import { toArticleData } from "@/lib/website-data";
import { articleSchema } from "@/lib/validations/website";

export async function GET(_request: Request, ctx: RouteContext<"/api/websites/[id]/articles">) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const website = await prisma.website.findFirst({ where: { id, ...clientScope(user) }, select: { id: true } });
  if (!website) return notFound();

  // Draf adalah pekerjaan internal tim, jadi klien hanya melihat artikel yang sudah terbit.
  const articles = await prisma.article.findMany({
    where: { websiteId: id, ...(user.role === "CLIENT" && { status: "PUBLISHED" as const }) },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { title: "asc" }],
  });
  return ok(articles);
}

export async function POST(request: Request, ctx: RouteContext<"/api/websites/[id]/articles">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const website = await prisma.website.findUnique({ where: { id }, select: { id: true } });
  if (!website) return notFound();

  const body = await parseBody(request, articleSchema);
  if (body.response) return body.response;

  const article = await prisma.article.create({
    data: { websiteId: id, source: "MANUAL", ...toArticleData(body.data) },
  });
  return ok(article, 201);
}
