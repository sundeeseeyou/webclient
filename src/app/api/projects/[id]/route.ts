import { NextResponse } from "next/server";
import { fail, notFound, ok, parseBody } from "@/lib/api";
import { parseDateInput, toDateInputValue } from "@/lib/dates";
import { notifyClientUsers } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { projectProgress } from "@/lib/progress";
import { invalidField } from "@/lib/projects";
import { clientScope, requireApiUser } from "@/lib/rbac";
import { END_DATE_ERROR, isDateRangeValid, projectUpdateSchema } from "@/lib/validations/project";

export async function GET(_request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const project = await prisma.project.findFirst({
    where: { id, ...clientScope(user) },
    include: {
      client: { select: { id: true, company: true } },
      website: { select: { id: true, domain: true } },
      sprints: { orderBy: { startDate: "asc" }, include: { tasks: { select: { status: true } } } },
    },
  });
  if (!project) return notFound();

  // Klien hanya melihat ringkasan tahap (jumlah pekerjaan), bukan detail task.
  const { sprints, ...rest } = project;
  return ok({
    ...rest,
    progress: projectProgress(project),
    sprints: sprints.map(({ tasks, ...sprint }) => ({
      ...sprint,
      taskCount: tasks.length,
      doneCount: tasks.filter((task) => task.status === "DONE").length,
    })),
  });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const body = await parseBody(request, projectUpdateSchema);
  if (body.response) return body.response;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return notFound();

  const { startDate, endDate, websiteId, ...fields } = body.data;
  const nextStart = startDate ?? toDateInputValue(existing.startDate);
  const nextEnd = endDate !== undefined ? endDate : existing.endDate && toDateInputValue(existing.endDate);
  // Tanggal yang tidak dikirim diambil dari data tersimpan, supaya rentang tetap dicek walau hanya satu tanggal diubah.
  if (!isDateRangeValid(nextStart, nextEnd)) return invalidField("endDate", END_DATE_ERROR);

  if (websiteId) {
    const website = await prisma.website.findFirst({ where: { id: websiteId, clientId: existing.clientId }, select: { id: true } });
    if (!website) return invalidField("websiteId", "Website bukan milik klien proyek ini");
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...fields,
      ...(websiteId !== undefined && { websiteId }),
      ...(startDate && { startDate: parseDateInput(startDate) }),
      ...(endDate !== undefined && { endDate: endDate ? parseDateInput(endDate) : null }),
    },
    select: { id: true, name: true, status: true },
  });

  if (project.status === "WAITING_APPROVAL" && existing.status !== "WAITING_APPROVAL") {
    await notifyClientUsers(existing.clientId, {
      type: "WAITING_APPROVAL",
      title: "Proyek menunggu persetujuan",
      body: `${project.name} sudah selesai dikerjakan dan menunggu persetujuan Anda.`,
      link: `/portal/projects/${project.id}`,
    });
  }
  return ok(project);
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const project = await prisma.project.findUnique({ where: { id }, select: { _count: { select: { invoices: true } } } });
  if (!project) return notFound();
  // Invoice ikut terhapus bila proyek dihapus (cascade), padahal invoice adalah catatan keuangan.
  if (project._count.invoices > 0) {
    return fail("Proyek ini sudah memiliki invoice sehingga tidak bisa dihapus. Ubah statusnya menjadi Ditunda bila perlu.", 409);
  }

  await prisma.project.delete({ where: { id } });
  return ok({ id });
}
