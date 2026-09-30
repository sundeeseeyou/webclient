import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { fail, isUniqueViolation, notFound, ok, parseBody } from "@/lib/api";
import { isEmailTaken } from "@/lib/clients";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { clientAccountSchema, EMAIL_TAKEN_MESSAGE } from "@/lib/validations/client";

const emailTaken = () => fail("Periksa kembali isian Anda.", 409, { email: EMAIL_TAKEN_MESSAGE });

export async function POST(request: NextRequest, ctx: RouteContext<"/api/clients/[id]/users">) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const body = await parseBody(request, clientAccountSchema);
  if (body.response) return body.response;

  const client = await prisma.client.findUnique({ where: { id }, select: { id: true } });
  if (!client) return notFound();
  if (await isEmailTaken(body.data.email)) return emailTaken();

  try {
    const account = await prisma.user.create({
      data: {
        name: body.data.name,
        email: body.data.email,
        passwordHash: await bcrypt.hash(body.data.password, 10),
        role: "CLIENT",
        clientId: client.id,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return ok(account, 201);
  } catch (error) {
    if (isUniqueViolation(error)) return emailTaken();
    throw error;
  }
}
