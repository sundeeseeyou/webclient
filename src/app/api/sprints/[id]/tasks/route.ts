import { NextResponse } from "next/server";
import { notFound, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { taskSchema } from "@/lib/validations/project";

export async function POST(request: Request, ctx: RouteContext<"/api/sprints/[id]/tasks">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const body = await parseBody(request, taskSchema);
  if (body.response) return body.response;

  const sprint = await prisma.sprint.findUnique({ where: { id }, select: { id: true } });
  if (!sprint) return notFound();

  // Task baru selalu masuk kolom "Belum Dikerjakan" di urutan paling bawah.
  const last = await prisma.task.findFirst({
    where: { sprintId: id, status: "TODO" },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const task = await prisma.task.create({
    data: { ...body.data, sprintId: id, status: "TODO", order: last ? last.order + 1 : 0 },
  });
  return ok(task, 201);
}
