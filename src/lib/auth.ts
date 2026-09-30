import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { client: { select: { isActive: true } } },
        });
        if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;

        // Klien yang dinonaktifkan admin tidak boleh masuk lagi walaupun password-nya benar.
        if (user.role === "CLIENT" && !user.client?.isActive) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role, clientId: user.clientId };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
        token.clientId = user.clientId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.clientId = token.clientId;
      return session;
    },
  },
});
