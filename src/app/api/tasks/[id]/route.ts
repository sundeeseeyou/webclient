import { NextResponse } from "next/server";
import { notFound, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { taskUpdateSchema } from "@/lib/validations/project";

export async function PATCH(request: Request, ctx: RouteContext<"/api/tasks/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const body = await parseBody(request, taskUpdateSchema);
  if (body.response) return body.response;

  const existing = await prisma.task.findUnique({ where: { id }, select: { sprintId: true, status: true } });
  if (!existing) return notFound();

  const { status, order, ...fields } = body.data;
  if (status === undefined && order === undefined) {
    return ok(await prisma.task.update({ where: { id }, data: fields }));
  }

  // Pindah kolom/urutan: task disisipkan di posisi tujuan, lalu task lain di kolom itu diberi nomor urut ulang.
  const targetStatus = status ?? existing.status;
  const siblings = await prisma.task.findMany({
    where: { sprintId: existing.sprintId, status: targetStatus, NOT: { id } },
    orderBy: [{ order: "asc" }, { updatedAt: "asc" }],
    select: { id: true, order: true },
  });
  const position = Math.min(order ?? siblings.length, siblings.length);
  const reordered = [...siblings.slice(0, position), null, ...siblings.slice(position)];
  const siblingUpdates = reordered.flatMap((sibling, index) =>
    sibling && sibling.order !== index ? [prisma.task.update({ where: { id: sibling.id }, data: { order: index } })] : [],
  );

  const [task] = await prisma.$transaction([
    prisma.task.update({ where: { id }, data: { ...fields, status: targetStatus, order: position } }),
    ...siblingUpdates,
  ]);
  return ok(task);
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/tasks/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true } });
  if (!task) return notFound();

  await prisma.task.delete({ where: { id } });
  return ok({ id });
}
