import { NextResponse, type NextRequest } from "next/server";
import { fail, isUniqueViolation, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { clientScope, requireApiUser } from "@/lib/rbac";
import { domainTakenResponse, toWebsiteData } from "@/lib/website-data";
import { websiteSchema } from "@/lib/validations/website";

export async function GET(request: NextRequest) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  // Filter clientId dari query hanya berguna untuk admin; untuk klien selalu ditimpa clientId dari session.
  const clientId = request.nextUrl.searchParams.get("clientId");
  const websites = await prisma.website.findMany({
    where: { ...(clientId && { clientId }), ...clientScope(user) },
    include: { client: { select: { id: true, company: true } } },
    orderBy: { domain: "asc" },
  });
  return ok(websites);
}

export async function POST(request: Request) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const body = await parseBody(request, websiteSchema);
  if (body.response) return body.response;

  const client = await prisma.client.findFirst({ where: { id: body.data.clientId, isActive: true }, select: { id: true } });
  if (!client) return fail("Periksa kembali isian Anda.", 400, { clientId: "Klien tidak ditemukan atau sudah nonaktif" });

  try {
    const website = await prisma.website.create({ data: toWebsiteData(body.data) });
    return ok(website, 201);
  } catch (error) {
    if (isUniqueViolation(error)) return domainTakenResponse();
    throw error;
  }
}
