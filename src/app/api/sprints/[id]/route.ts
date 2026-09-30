import { NextResponse } from "next/server";
import { notFound, ok, parseBody } from "@/lib/api";
import { parseDateInput, toDateInputValue } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { invalidField } from "@/lib/projects";
import { requireApiUser } from "@/lib/rbac";
import { END_DATE_ERROR, isDateRangeValid, sprintUpdateSchema } from "@/lib/validations/project";

export async function PATCH(request: Request, ctx: RouteContext<"/api/sprints/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const body = await parseBody(request, sprintUpdateSchema);
  if (body.response) return body.response;

  const existing = await prisma.sprint.findUnique({ where: { id }, select: { startDate: true, endDate: true } });
  if (!existing) return notFound();

  const { startDate, endDate, ...fields } = body.data;
  const nextStart = startDate ?? toDateInputValue(existing.startDate);
  const nextEnd = endDate ?? toDateInputValue(existing.endDate);
  if (!isDateRangeValid(nextStart, nextEnd)) return invalidField("endDate", END_DATE_ERROR);

  const sprint = await prisma.sprint.update({
    where: { id },
    data: {
      ...fields,
      ...(startDate && { startDate: parseDateInput(startDate) }),
      ...(endDate && { endDate: parseDateInput(endDate) }),
    },
  });
  return ok(sprint);
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/sprints/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const sprint = await prisma.sprint.findUnique({ where: { id }, select: { id: true } });
  if (!sprint) return notFound();

  await prisma.sprint.delete({ where: { id } });
  return ok({ id });
}
