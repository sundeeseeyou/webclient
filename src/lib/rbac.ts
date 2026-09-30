import type { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { fail } from "@/lib/api";
import { auth } from "@/lib/auth";

type BaseUser = { id: string; name: string; email: string };
export type AdminUser = BaseUser & { role: "ADMIN"; clientId: null };
export type ClientUser = BaseUser & { role: "CLIENT"; clientId: string };
export type SessionUser = AdminUser | ClientUser;

export function homePathFor(role: SessionUser["role"]): "/admin" | "/portal" {
  return role === "ADMIN" ? "/admin" : "/portal";
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  const { id, name, email, role, clientId } = session.user;
  const base = { id, name: name ?? "", email: email ?? "" };
  if (role === "ADMIN") return { ...base, role, clientId: null };
  return clientId ? { ...base, role, clientId } : null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect(homePathFor(user.role));
  return user;
}

// clientId selalu diambil dari session, bukan dari parameter URL, agar klien tidak bisa membuka data klien lain.
export async function requireClient(): Promise<ClientUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "CLIENT") redirect(homePathFor(user.role));
  return user;
}

export async function requireApiUser(role: "ADMIN"): Promise<AdminUser | NextResponse>;
export async function requireApiUser(role: "CLIENT"): Promise<ClientUser | NextResponse>;
export async function requireApiUser(): Promise<SessionUser | NextResponse>;
export async function requireApiUser(role?: SessionUser["role"]): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return fail("Sesi Anda sudah berakhir. Silakan masuk kembali.", 401);
  if (role && user.role !== role) return fail("Anda tidak memiliki akses untuk tindakan ini.", 403);
  return user;
}

// Filter Prisma untuk tabel yang punya kolom clientId: admin melihat semua, klien hanya miliknya.
export function clientScope(user: SessionUser): { clientId?: string } {
  return user.role === "CLIENT" ? { clientId: user.clientId } : {};
}
