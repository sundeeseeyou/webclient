import { NextResponse } from "next/server";
import { ok } from "@/lib/api";
import { getNotificationSummary } from "@/lib/notify";
import { requireApiUser } from "@/lib/rbac";

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;

  return ok(await getNotificationSummary(user.id));
}
