import { NextResponse, type NextRequest } from "next/server";
import { ok, parseBody } from "@/lib/api";
import { notifyAdmins } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { invalidField } from "@/lib/projects";
import { clientScope, requireApiUser } from "@/lib/rbac";
import { listRequests, parseRequestFilters, requestFilterWhere } from "@/lib/requests";
import { computeDueAt } from "@/lib/sla";
import { requestSchema, WEBSITE_REQUIRED } from "@/lib/validations/request";

export async function GET(request: NextRequest) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  if (user.role === "CLIENT") return ok(await listRequests(clientScope(user), "newest"));

  const filters = parseRequestFilters(Object.fromEntries(request.nextUrl.searchParams));
  return ok(await listRequests(requestFilterWhere(filters)));
}

export async function POST(request: Request) {
  const user = await requireApiUser("CLIENT");
  if (user instanceof NextResponse) return user;

  const body = await parseBody(request, requestSchema);
  if (body.response) return body.response;
  const { websiteId, projectId, ...fields } = body.data;

  // Website dan proyek harus milik klien yang sedang login; clientId selalu dari session.
  const project = projectId
    ? await prisma.project.findFirst({ where: { id: projectId, clientId: user.clientId }, select: { id: true, websiteId: true } })
    : null;
  if (projectId && !project) return invalidField("projectId", "Proyek tidak ditemukan");

  if (websiteId) {
    const website = await prisma.website.findFirst({ where: { id: websiteId, clientId: user.clientId }, select: { id: true } });
    if (!website) return invalidField("websiteId", "Website tidak ditemukan");
  }
  const resolvedWebsiteId = websiteId ?? project?.websiteId ?? null;
  if (!resolvedWebsiteId && (await prisma.website.count({ where: { clientId: user.clientId } })) > 0) {
    return invalidField("websiteId", WEBSITE_REQUIRED);
  }

  const now = new Date();
  const created = await prisma.slaRequest.create({
    data: {
      ...fields,
      clientId: user.clientId,
      createdById: user.id,
      projectId,
      websiteId: resolvedWebsiteId,
      createdAt: now,
      dueAt: computeDueAt(now, fields.priority),
    },
    select: { id: true, title: true, status: true, dueAt: true, client: { select: { company: true } } },
  });

  await notifyAdmins({
    type: "NEW_REQUEST",
    title: "Permintaan baru",
    body: `${created.client.company}: ${created.title}`,
    link: `/admin/requests/${created.id}`,
  });
  return ok({ id: created.id, status: created.status, dueAt: created.dueAt }, 201);
}
