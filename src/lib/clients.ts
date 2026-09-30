import { prisma } from "@/lib/prisma";
import { progressSelect, projectProgress } from "@/lib/progress";

// Dipakai bersama oleh halaman /admin/clients dan GET /api/clients agar hasil pencarian selalu sama.
export async function listClients(query?: string) {
  const q = query?.trim();
  return prisma.client.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ isActive: "desc" }, { company: "asc" }],
    select: {
      id: true,
      company: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      _count: { select: { websites: true } },
    },
  });
}

export type ClientListItem = Awaited<ReturnType<typeof listClients>>[number];

export async function getClientDetail(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      users: {
        where: { role: "CLIENT" },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
      websites: {
        select: { id: true, domain: true, platform: true, status: true, domainRenewAt: true, hostingRenewAt: true },
        orderBy: { domain: "asc" },
      },
      projects: {
        select: { id: true, name: true, type: true, status: true, startDate: true, endDate: true, ...progressSelect },
        orderBy: { startDate: "desc" },
      },
    },
  });
  if (!client) return null;

  return {
    ...client,
    projects: client.projects.map(({ sprints, ...project }) => ({ ...project, progress: projectProgress({ sprints }) })),
  };
}

export type ClientDetail = NonNullable<Awaited<ReturnType<typeof getClientDetail>>>;

export async function isEmailTaken(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user !== null;
}
