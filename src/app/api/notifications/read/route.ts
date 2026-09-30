import { NextResponse } from "next/server";
import { z } from "zod";
import { ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/rbac";

// Tanpa id berarti tandai semua notifikasi milik user sebagai dibaca.
const markReadSchema = z.object({ id: z.string().min(1).optional() });

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  const body = await parseBody(request, markReadSchema);
  if (body.response) return body.response;

  const { count } = await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null, ...(body.data.id && { id: body.data.id }) },
    data: { readAt: new Date() },
  });
  return ok({ updated: count });
}
