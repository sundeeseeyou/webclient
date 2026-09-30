"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { authText } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { homePathFor } from "@/lib/rbac";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export type LoginResult = { error: string } | undefined;

export async function login(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: authText.invalidCredentials };

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return { error: authText.invalidCredentials };
    throw error;
  }

  // Redirect langsung ke portal sesuai role; redirect bertingkat lewat "/" membuat URL browser tertahan di "/".
  const user = await prisma.user.findUniqueOrThrow({ where: { email: parsed.data.email }, select: { role: true } });
  redirect(homePathFor(user.role));
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
