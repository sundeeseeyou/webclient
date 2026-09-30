import { PrismaClient } from "@prisma/client";

// Hot reload di mode dev membuat modul dievaluasi ulang; simpan satu instance agar koneksi database tidak habis.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
