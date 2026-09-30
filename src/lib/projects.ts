import { ProjectStatus, type Prisma } from "@prisma/client";
import { fail } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { progressSelect, projectProgress } from "@/lib/progress";

const projectListInclude = {
  client: { select: { id: true, company: true } },
  website: { select: { id: true, domain: true } },
  ...progressSelect,
} satisfies Prisma.ProjectInclude;

export async function listProjects(where: Prisma.ProjectWhereInput) {
  const projects = await prisma.project.findMany({
    where,
    include: projectListInclude,
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
  });
  return projects.map(({ sprints, ...project }) => ({ ...project, progress: projectProgress({ sprints }) }));
}

export type ProjectListItem = Awaited<ReturnType<typeof listProjects>>[number];

// Nilai filter dari URL bisa berisi apa saja, jadi hanya status yang dikenal yang dipakai.
export function parseProjectStatus(value: unknown): ProjectStatus | undefined {
  return Object.values(ProjectStatus).find((status) => status === value);
}

export function invalidField(field: string, message: string) {
  return fail("Periksa kembali isian Anda.", 400, { [field]: message });
}
