"use client";

import { useRouter } from "next/navigation";
import { PiPlus } from "react-icons/pi";
import { toast } from "sonner";
import type { SprintItem } from "@/components/admin/project-types";
import { SprintDialog } from "@/components/admin/sprint-dialog";
import { TaskDialog } from "@/components/admin/task-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { uiText } from "@/lib/labels";

export function SprintActions({ projectId, sprint }: { projectId: string; sprint: SprintItem }) {
  const router = useRouter();

  const remove = async () => {
    const result = await apiRequest(`/api/sprints/${sprint.id}`, { method: "DELETE" });
    if (result.error) {
      toast.error(result.error.message);
      return false;
    }
    toast.success("Sprint berhasil dihapus.");
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <TaskDialog
        sprintId={sprint.id}
        trigger={
          <Button size="sm">
            <PiPlus />
            Tambah Task
          </Button>
        }
      />
      <SprintDialog
        projectId={projectId}
        sprint={sprint}
        trigger={
          <Button variant="outline" size="sm">
            {uiText.edit}
          </Button>
        }
      />
      <ConfirmDialog
        trigger={
          <Button variant="outline" size="sm" className="text-danger hover:text-danger">
            {uiText.delete}
          </Button>
        }
        title="Hapus sprint ini?"
        description={`${sprint.name} beserta ${sprint.tasks.length} task di dalamnya akan dihapus permanen.`}
        confirmLabel="Hapus sprint"
        onConfirm={remove}
      />
    </div>
  );
}
