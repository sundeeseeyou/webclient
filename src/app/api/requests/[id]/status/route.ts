import { NextResponse } from "next/server";
import { fail, notFound, ok, parseBody } from "@/lib/api";
import { requestStatusLabels } from "@/lib/labels";
import { notifyClientUsers } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { isClosedRequest } from "@/lib/requests";
import { canTransition } from "@/lib/sla";
import { requestStatusSchema } from "@/lib/validations/request";

export async function PATCH(request: Request, ctx: RouteContext<"/api/requests/[id]/status">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const body = await parseBody(request, requestStatusSchema);
  if (body.response) return body.response;
  const { status, adminResponse, rejectionReason } = body.data;

  const existing = await prisma.slaRequest.findUnique({ where: { id } });
  if (!existing) return notFound();

  if (!canTransition(existing.status, status)) {
    return fail(
      `Status tidak bisa diubah dari "${requestStatusLabels[existing.status]}" ke "${requestStatusLabels[status]}".`,
      400,
    );
  }

  const now = new Date();
  // Syarat status lama ikut dicek agar dua admin yang menekan tombol bersamaan tidak menimpa satu sama lain.
  const updated = await prisma.slaRequest.updateMany({
    where: { id, status: existing.status },
    data: {
      status,
      // Waktu respon pertama dipakai untuk menilai SLA, jadi hanya diisi sekali.
      ...(existing.respondedAt === null && { respondedAt: now }),
      ...(isClosedRequest(status) && { resolvedAt: now }),
      // Tanggapan kosong berarti tanggapan lama tetap dipakai.
      ...(adminResponse && { adminResponse }),
      ...(status === "REJECTED" && { rejectionReason }),
    },
  });
  if (updated.count === 0) {
    return fail("Status permintaan baru saja diubah oleh admin lain. Muat ulang halaman lalu coba lagi.", 409);
  }

  await notifyClientUsers(existing.clientId, {
    type: "REQUEST_UPDATED",
    title: "Status permintaan diperbarui",
    body: `${existing.title}: ${requestStatusLabels[status]}`,
    link: "/portal/requests",
  });
  return ok({ id, status });
}
