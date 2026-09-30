"use client";

import type { TaskStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { KanbanColumn } from "@/components/admin/kanban-column";
import { TASK_STATUSES, type TaskItem } from "@/components/admin/project-types";
import { TaskCard } from "@/components/admin/task-card";
import { apiRequest } from "@/lib/api-client";
import { taskStatusLabels } from "@/lib/labels";

function tasksIn(tasks: TaskItem[], status: TaskStatus): TaskItem[] {
  return tasks.filter((task) => task.status === status).sort((a, b) => a.order - b.order);
}

export function KanbanBoard({ sprintId, tasks: serverTasks }: { sprintId: string; tasks: TaskItem[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(serverTasks);
  const [syncedTasks, setSyncedTasks] = useState(serverTasks);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Setelah router.refresh() data server terbaru menggantikan state lokal (pola "menyesuaikan state saat props berubah").
  if (serverTasks !== syncedTasks) {
    setSyncedTasks(serverTasks);
    setTasks(serverTasks);
  }

  const moveTask = async (taskId: string, status: TaskStatus, index: number) => {
    const task = tasks.find((item) => item.id === taskId);
    // Kartu dari sprint lain diabaikan: task hanya bisa dipindah di dalam sprint-nya sendiri.
    if (!task) return;

    const target = tasksIn(tasks, status).filter((item) => item.id !== taskId);
    const position = Math.min(index, target.length);
    const currentPosition = tasksIn(tasks, task.status).findIndex((item) => item.id === taskId);
    if (task.status === status && currentPosition === position) return;

    target.splice(position, 0, { ...task, status });
    const reordered = new Map(target.map((item, order) => [item.id, { ...item, order }]));
    const previous = tasks;
    // Update optimistis: kartu langsung pindah, lalu dikembalikan bila API gagal.
    setTasks(tasks.map((item) => reordered.get(item.id) ?? item));

    const result = await apiRequest(`/api/tasks/${taskId}`, { method: "PATCH", body: { status, order: position } });
    if (result.error) {
      setTasks(previous);
      toast.error(`Task gagal dipindahkan. ${result.error.message}`);
      return;
    }
    if (task.status !== status) toast.success(`"${task.title}" dipindahkan ke ${taskStatusLabels[status]}.`);
    router.refresh();
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TASK_STATUSES.map((status, columnIndex) => {
        const columnTasks = tasksIn(tasks, status);
        const previousStatus = columnIndex > 0 ? TASK_STATUSES[columnIndex - 1] : undefined;
        const nextStatus = columnIndex < TASK_STATUSES.length - 1 ? TASK_STATUSES[columnIndex + 1] : undefined;
        return (
          <KanbanColumn
            key={status}
            status={status}
            count={columnTasks.length}
            onDropTask={(taskId, index) => {
              setDraggingId(null);
              void moveTask(taskId, status, index);
            }}
          >
            {columnTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                sprintId={sprintId}
                previousStatus={previousStatus}
                nextStatus={nextStatus}
                isDragging={draggingId === task.id}
                onMove={(to) => void moveTask(task.id, to, tasksIn(tasks, to).length)}
                onDragStart={() => setDraggingId(task.id)}
                onDragEnd={() => setDraggingId(null)}
              />
            ))}
          </KanbanColumn>
        );
      })}
    </div>
  );
}
