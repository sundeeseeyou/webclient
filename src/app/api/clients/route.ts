import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { fail, isUniqueViolation, ok, parseBody } from "@/lib/api";
import { isEmailTaken, listClients } from "@/lib/clients";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";
import { createClientSchema, EMAIL_TAKEN_MESSAGE } from "@/lib/validations/client";

const emailTaken = () => fail("Periksa kembali isian Anda.", 409, { "account.email": EMAIL_TAKEN_MESSAGE });

export async function GET(request: NextRequest) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  return ok(await listClients(query));
}

export async function POST(request: Request) {
  const user = await requireApiUser("ADMIN");
  if (user instanceof NextResponse) return user;

  const body = await parseBody(request, createClientSchema);
  if (body.response) return body.response;

  const { account, ...profile } = body.data;
  if (account && (await isEmailTaken(account.email))) return emailTaken();

  const passwordHash = account ? await bcrypt.hash(account.password, 10) : null;
  try {
    // Klien dan akun login disimpan dalam satu transaksi: kalau akun gagal dibuat, data klien ikut dibatalkan.
    const client = await prisma.$transaction(async (tx) => {
      const created = await tx.client.create({ data: profile });
      if (account && passwordHash) {
        await tx.user.create({
          data: { name: account.name, email: account.email, passwordHash, role: "CLIENT", clientId: created.id },
        });
      }
      return created;
    });
    return ok(client, 201);
  } catch (error) {
    // Email bisa terpakai oleh request lain di antara pengecekan dan penyimpanan; constraint unik database jadi penjaga terakhir.
    if (isUniqueViolation(error)) return emailTaken();
    throw error;
  }
}
