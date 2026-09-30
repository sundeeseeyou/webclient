"use client";

import type { TaskStatus } from "@prisma/client";
import { cn } from "cn";
import { useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import { PiArrowLeft, PiArrowRight, PiPencilSimple, PiTrash } from "react-icons/pi";
import { toast } from "sonner";
import { TASK_DRAG_TYPE, type TaskItem } from "@/components/admin/project-types";
import { TaskDialog } from "@/components/admin/task-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { taskStatusLabels } from "@/lib/labels";

type TaskCardProps = {
  task: TaskItem;
  sprintId: string;
  previousStatus?: TaskStatus;
  nextStatus?: TaskStatus;
  isDragging: boolean;
  onMove: (status: TaskStatus) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

function MoveButton({ to, icon: Icon, onMove }: { to: TaskStatus; icon: IconType; onMove: (status: TaskStatus) => void }) {
  const label = `Pindah ke ${taskStatusLabels[to]}`;
  return (
    <Button type="button" variant="outline" size="icon-sm" title={label} onClick={() => onMove(to)}>
      <Icon />
      <span className="sr-only">{label}</span>
    </Button>
  );
}

export function TaskCard({ task, sprintId, previousStatus, nextStatus, isDragging, onMove, onDragStart, onDragEnd }: TaskCardProps) {
  const router = useRouter();

  const remove = async () => {
    const result = await apiRequest(`/api/tasks/${task.id}`, { method: "DELETE" });
    if (result.error) {
      toast.error(result.error.message);
      return false;
    }
    toast.success("Task berhasil dihapus.");
    router.refresh();
  };

  return (
    <article
      data-task-id={task.id}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(TASK_DRAG_TYPE, task.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-lg border bg-card p-3 shadow-xs transition-opacity active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 pt-1 font-medium wrap-break-word">{task.title}</p>
        <div className="-mr-1 flex shrink-0">
          <TaskDialog
            sprintId={sprintId}
            task={task}
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" title="Ubah task" className="text-muted-foreground">
                <PiPencilSimple />
                <span className="sr-only">Ubah task {task.title}</span>
              </Button>
            }
          />
          <ConfirmDialog
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" title="Hapus task" className="text-muted-foreground hover:text-danger">
                <PiTrash />
                <span className="sr-only">Hapus task {task.title}</span>
              </Button>
            }
            title="Hapus task ini?"
            description={`Task "${task.title}" akan dihapus permanen.`}
            onConfirm={remove}
          />
        </div>
      </div>
      {task.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>}
      <div className="mt-3 flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={task.assignee ?? undefined}>
          {task.assignee ?? "Belum ada penanggung jawab"}
        </p>
        <div className="flex shrink-0 gap-1">
          {previousStatus && <MoveButton to={previousStatus} icon={PiArrowLeft} onMove={onMove} />}
          {nextStatus && <MoveButton to={nextStatus} icon={PiArrowRight} onMove={onMove} />}
        </div>
      </div>
    </article>
  );
}
