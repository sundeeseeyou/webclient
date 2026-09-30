import { NextResponse } from "next/server";
import { fail, notFound, ok } from "@/lib/api";
import { notifyAdmins } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";

const NOT_WAITING_APPROVAL = "Proyek ini tidak sedang menunggu persetujuan.";

export async function POST(_request: Request, ctx: RouteContext<"/api/projects/[id]/approve">) {
  const user = await requireApiUser("CLIENT");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const project = await prisma.project.findFirst({
    where: { id, clientId: user.clientId },
    select: { name: true, client: { select: { company: true } } },
  });
  if (!project) return notFound();

  // Status ikut dicek saat update agar klik ganda atau persetujuan setelah revisi tidak tercatat.
  const approvedAt = new Date();
  const updated = await prisma.project.updateMany({
    where: { id, clientId: user.clientId, status: "WAITING_APPROVAL" },
    data: { status: "DONE", approvedAt },
  });
  if (updated.count === 0) return fail(NOT_WAITING_APPROVAL, 400);

  await notifyAdmins({
    type: "PROJECT_APPROVED",
    title: "Proyek disetujui klien",
    body: `${project.client.company}: ${project.name}`,
    link: `/admin/projects/${id}`,
  });
  return ok({ id, status: "DONE", approvedAt });
}
