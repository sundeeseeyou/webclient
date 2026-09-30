import { NextResponse, type NextRequest } from "next/server";
import { notFound, ok, parseBody } from "@/lib/api";
import { getClientDetail } from "@/lib/clients";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { updateClientSchema } from "@/lib/validations/client";

type Context = RouteContext<"/api/clients/[id]">;

async function clientExists(id: string): Promise<boolean> {
  const client = await prisma.client.findUnique({ where: { id }, select: { id: true } });
  return client !== null;
}

export async function GET(_request: NextRequest, ctx: Context) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const client = await getClientDetail(id);
  return client ? ok(client) : notFound();
}

export async function PATCH(request: NextRequest, ctx: Context) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const body = await parseBody(request, updateClientSchema);
  if (body.response) return body.response;
  if (!(await clientExists(id))) return notFound();

  const client = await prisma.client.update({ where: { id }, data: body.data });
  return ok(client);
}

// Nonaktifkan, bukan hapus: riwayat proyek, invoice, dan permintaan klien tetap tersimpan. Akun kliennya tidak bisa login lagi.
export async function DELETE(_request: NextRequest, ctx: Context) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  if (!(await clientExists(id))) return notFound();

  const client = await prisma.client.update({ where: { id }, data: { isActive: false } });
  return ok(client);
}
