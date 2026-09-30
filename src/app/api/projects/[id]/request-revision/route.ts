import { NextResponse } from "next/server";
import { fail, notFound, ok, parseBody } from "@/lib/api";
import { notifyAdmins } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { computeDueAt } from "@/lib/sla";
import { revisionSchema } from "@/lib/validations/request";

export async function POST(request: Request, ctx: RouteContext<"/api/projects/[id]/request-revision">) {
  const user = await requireApiUser("CLIENT");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const project = await prisma.project.findFirst({
    where: { id, clientId: user.clientId },
    select: { name: true, websiteId: true, client: { select: { company: true } } },
  });
  if (!project) return notFound();

  const body = await parseBody(request, revisionSchema);
  if (body.response) return body.response;

  const now = new Date();
  // Permintaan revisi dan perubahan status proyek harus terjadi bersama; bila salah satu gagal, keduanya batal.
  const revision = await prisma.$transaction(async (tx) => {
    const updated = await tx.project.updateMany({
      where: { id, clientId: user.clientId, status: "WAITING_APPROVAL" },
      // Persetujuan lama (bila proyek pernah disetujui) tidak berlaku lagi setelah klien meminta revisi.
      data: { status: "REVISION", approvedAt: null },
    });
    if (updated.count === 0) return null;

    return tx.slaRequest.create({
      data: {
        ...body.data,
        clientId: user.clientId,
        createdById: user.id,
        projectId: id,
        websiteId: project.websiteId,
        createdAt: now,
        dueAt: computeDueAt(now, body.data.priority),
      },
      select: { id: true, title: true },
    });
  });
  if (!revision) return fail("Proyek ini tidak sedang menunggu persetujuan.", 400);

  await notifyAdmins({
    type: "NEW_REQUEST",
    title: "Permintaan revisi proyek",
    body: `${project.client.company}: ${project.name} - ${revision.title}`,
    link: `/admin/requests/${revision.id}`,
  });
  return ok({ id: revision.id, projectStatus: "REVISION" }, 201);
}
