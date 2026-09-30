"use client";

import type { TaskStatus } from "@prisma/client";
import { cn } from "cn";
import { useState } from "react";
import { TASK_DRAG_TYPE } from "@/components/admin/project-types";
import { taskStatusLabels } from "@/lib/labels";

type KanbanColumnProps = {
  status: TaskStatus;
  count: number;
  onDropTask: (taskId: string, index: number) => void;
  children: React.ReactNode;
};

export function KanbanColumn({ status, count, onDropTask, children }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const acceptsDrag = (event: React.DragEvent) => event.dataTransfer.types.includes(TASK_DRAG_TYPE);

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    if (!acceptsDrag(event)) return;
    event.preventDefault();
    setIsOver(false);
    const taskId = event.dataTransfer.getData(TASK_DRAG_TYPE);
    // Posisi tujuan = kartu pertama yang titik tengahnya berada di bawah kursor (kartu yang diseret tidak dihitung).
    const cards = [...event.currentTarget.querySelectorAll<HTMLElement>("[data-task-id]")].filter(
      (card) => card.dataset.taskId !== taskId,
    );
    const index = cards.findIndex((card) => {
      const rect = card.getBoundingClientRect();
      return event.clientY < rect.top + rect.height / 2;
    });
    onDropTask(taskId, index === -1 ? cards.length : index);
  };

  return (
    <section
      aria-label={taskStatusLabels[status]}
      onDragOver={(event) => {
        if (!acceptsDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setIsOver(true);
      }}
      onDragLeave={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        setIsOver(false);
      }}
      onDrop={handleDrop}
      className={cn(
        "flex min-w-0 flex-col rounded-xl border bg-muted/60 p-3 transition-colors",
        isOver && "border-primary/40 bg-primary/5",
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2 px-1">
        <h4 className="font-sans text-sm font-medium">{taskStatusLabels[status]}</h4>
        <span className="rounded-full border bg-card px-2 py-0.5 text-xs text-muted-foreground tabular-nums">{count}</span>
      </header>
      <div className="flex min-h-20 flex-1 flex-col gap-2">
        {count === 0 ? (
          <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
            Belum ada task. Seret kartu ke sini untuk memindahkan.
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
