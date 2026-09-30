import { NextResponse } from "next/server";
import { notFound, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { toArticleData } from "@/lib/website-data";
import { articleSchema } from "@/lib/validations/website";

export async function PATCH(request: Request, ctx: RouteContext<"/api/articles/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const existing = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return notFound();

  const body = await parseBody(request, articleSchema);
  if (body.response) return body.response;

  const article = await prisma.article.update({ where: { id }, data: toArticleData(body.data) });
  return ok(article);
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/articles/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const existing = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return notFound();

  await prisma.article.delete({ where: { id } });
  return ok(existing);
}
