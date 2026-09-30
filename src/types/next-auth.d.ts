import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    clientId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      clientId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    clientId: string | null;
  }
}
