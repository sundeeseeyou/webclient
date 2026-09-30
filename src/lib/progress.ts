import type { Prisma, TaskStatus } from "@prisma/client";

export function calculateProgress(statuses: TaskStatus[]): number {
  if (statuses.length === 0) return 0;
  const done = statuses.filter((status) => status === "DONE").length;
  return Math.round((done / statuses.length) * 100);
}

// Pilihan kolom minimal untuk menghitung progres proyek lewat Prisma `select`/`include`.
export const progressSelect = {
  sprints: { select: { tasks: { select: { status: true } } } },
} satisfies Prisma.ProjectSelect;

export function projectProgress(project: { sprints: { tasks: { status: TaskStatus }[] }[] }): number {
  return calculateProgress(project.sprints.flatMap((sprint) => sprint.tasks.map((task) => task.status)));
}
