import { PiKanban, PiPlus } from "react-icons/pi";
import { KanbanBoard } from "@/components/admin/kanban-board";
import type { SprintItem } from "@/components/admin/project-types";
import { SprintActions } from "@/components/admin/sprint-actions";
import { SprintDialog } from "@/components/admin/sprint-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { sprintStatusLabels } from "@/lib/labels";
import { sprintStatusTone } from "@/lib/status-tones";

type SprintListProps = {
  projectId: string;
  sprints: SprintItem[];
  progress: number;
  taskCount: number;
  doneCount: number;
};

function SprintSection({ projectId, sprint }: { projectId: string; sprint: SprintItem }) {
  const done = sprint.tasks.filter((task) => task.status === "DONE").length;

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{sprint.name}</h3>
            <StatusBadge tone={sprintStatusTone[sprint.status]}>{sprintStatusLabels[sprint.status]}</StatusBadge>
          </div>
          <p className="text-muted-foreground">
            {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)} · {done} dari {sprint.tasks.length} task selesai
          </p>
          {sprint.goal && <p className="wrap-break-word">Tujuan: {sprint.goal}</p>}
        </div>
        <SprintActions projectId={projectId} sprint={sprint} />
      </div>
      <div className="p-4 sm:p-5">
        <KanbanBoard sprintId={sprint.id} tasks={sprint.tasks} />
      </div>
    </Card>
  );
}

export function SprintList({ projectId, sprints, progress, taskCount, doneCount }: SprintListProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <p className="text-xs text-muted-foreground">Progres proyek</p>
            <div className="mt-2">
              <ProgressBar value={progress} label="Progres proyek" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {doneCount} dari {taskCount} task selesai. Pindahkan task dengan menyeret kartu atau tombol panah.
            </p>
          </div>
          <SprintDialog
            projectId={projectId}
            defaultName={`Sprint ${sprints.length + 1}`}
            trigger={
              <Button className="self-start sm:self-auto">
                <PiPlus />
                Tambah Sprint
              </Button>
            }
          />
        </CardContent>
      </Card>
      {sprints.length === 0 ? (
        <EmptyState
          icon={PiKanban}
          title="Belum ada sprint"
          description="Klik 'Tambah Sprint' untuk membuat tahap kerja pertama, lalu tambahkan task di dalamnya."
        />
      ) : (
        sprints.map((sprint) => <SprintSection key={sprint.id} projectId={projectId} sprint={sprint} />)
      )}
    </div>
  );
}
