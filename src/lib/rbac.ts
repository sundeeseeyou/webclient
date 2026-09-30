import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  clientId: string | null;
};

export function homePathFor(role: Role): "/admin" | "/portal" {
  return role === "ADMIN" ? "/admin" : "/portal";
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  const { id, name, email, role, clientId } = session.user;
  return { id, name: name ?? "", email: email ?? "", role, clientId };
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect(homePathFor(user.role));
  return user;
}

// clientId selalu diambil dari session, bukan dari parameter URL, agar klien tidak bisa membuka data klien lain.
export async function requireClient(): Promise<SessionUser & { clientId: string }> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "CLIENT" || !user.clientId) redirect(homePathFor(user.role));
  return { ...user, clientId: user.clientId };
}
