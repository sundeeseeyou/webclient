import { NextResponse } from "next/server";
import { notFound, ok, parseBody } from "@/lib/api";
import { parseDateInput } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { sprintSchema } from "@/lib/validations/project";

export async function GET(_request: Request, ctx: RouteContext<"/api/projects/[id]/sprints">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      sprints: {
        orderBy: { startDate: "asc" },
        include: { tasks: { orderBy: [{ order: "asc" }, { updatedAt: "asc" }] } },
      },
    },
  });
  if (!project) return notFound();
  return ok(project.sprints);
}

export async function POST(request: Request, ctx: RouteContext<"/api/projects/[id]/sprints">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const body = await parseBody(request, sprintSchema);
  if (body.response) return body.response;

  const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!project) return notFound();

  const { startDate, endDate, ...fields } = body.data;
  const sprint = await prisma.sprint.create({
    data: { ...fields, projectId: id, startDate: parseDateInput(startDate), endDate: parseDateInput(endDate) },
  });
  return ok(sprint, 201);
}
