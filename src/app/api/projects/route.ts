import { NextResponse, type NextRequest } from "next/server";
import { ok, parseBody } from "@/lib/api";
import { parseDateInput } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { invalidField, listProjects, parseProjectStatus } from "@/lib/projects";
import { clientScope, requireApiUser } from "@/lib/rbac";
import { projectSchema } from "@/lib/validations/project";

export async function GET(request: NextRequest) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  const params = request.nextUrl.searchParams;
  // Filter clientId dari URL hanya berlaku untuk admin; klien selalu dibatasi clientId dari session.
  const clientFilter = user.role === "ADMIN" ? params.get("clientId") || undefined : undefined;
  const projects = await listProjects({
    ...(clientFilter && { clientId: clientFilter }),
    ...clientScope(user),
    status: parseProjectStatus(params.get("status")),
  });
  return ok(projects);
}

export async function POST(request: Request) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const body = await parseBody(request, projectSchema);
  if (body.response) return body.response;
  const { clientId, websiteId, startDate, endDate, ...fields } = body.data;

  const client = await prisma.client.findFirst({ where: { id: clientId, isActive: true }, select: { id: true } });
  if (!client) return invalidField("clientId", "Klien tidak ditemukan atau sudah nonaktif");

  if (websiteId) {
    const website = await prisma.website.findFirst({ where: { id: websiteId, clientId }, select: { id: true } });
    if (!website) return invalidField("websiteId", "Website bukan milik klien yang dipilih");
  }

  const project = await prisma.project.create({
    data: {
      ...fields,
      clientId,
      websiteId,
      startDate: parseDateInput(startDate),
      endDate: endDate ? parseDateInput(endDate) : null,
    },
    select: { id: true },
  });
  return ok(project, 201);
}
