import type { Sprint, Task, TaskStatus } from "@prisma/client";

export type TaskItem = Pick<Task, "id" | "title" | "description" | "assignee" | "status" | "order">;

export type SprintItem = Pick<Sprint, "id" | "name" | "goal" | "startDate" | "endDate" | "status"> & {
  tasks: TaskItem[];
};

// Urutan kolom kanban dari kiri ke kanan.
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const satisfies readonly TaskStatus[];

// Tipe data drag & drop khusus agar kolom hanya menerima kartu task, bukan teks atau file yang diseret.
export const TASK_DRAG_TYPE = "application/x-boowat-task";
