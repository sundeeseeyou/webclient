import { NextResponse } from "next/server";
import { notFound, ok, parseBody } from "@/lib/api";
import { createProjectMessage, getProjectMessages, messageSnippet } from "@/lib/messages";
import { notifyAdmins, notifyClientUsers } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { clientScope, requireApiUser } from "@/lib/rbac";
import { messageSchema } from "@/lib/validations/project";

export async function GET(_request: Request, ctx: RouteContext<"/api/projects/[id]/messages">) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const project = await prisma.project.findFirst({ where: { id, ...clientScope(user) }, select: { id: true } });
  if (!project) return notFound();

  return ok(await getProjectMessages(id));
}

export async function POST(request: Request, ctx: RouteContext<"/api/projects/[id]/messages">) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const body = await parseBody(request, messageSchema);
  if (body.response) return body.response;

  const project = await prisma.project.findFirst({
    where: { id, ...clientScope(user) },
    select: { id: true, name: true, clientId: true, client: { select: { company: true } } },
  });
  if (!project) return notFound();

  const message = await createProjectMessage(id, user.id, body.data.body);

  // Notifikasi selalu ke pihak lain: pesan klien ke semua admin, pesan admin ke semua akun klien pemilik proyek.
  const preview = `${project.name}: ${messageSnippet(message.body)}`;
  if (user.role === "CLIENT") {
    await notifyAdmins({
      type: "NEW_MESSAGE",
      title: `Pesan baru dari ${project.client.company}`,
      body: preview,
      link: `/admin/projects/${id}?tab=pesan`,
    });
  } else {
    await notifyClientUsers(project.clientId, {
      type: "NEW_MESSAGE",
      title: "Pesan baru dari tim Boowat",
      body: preview,
      link: `/portal/projects/${id}`,
    });
  }
  return ok(message, 201);
}
