import type { SprintStatus, TaskStatus } from "@prisma/client";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { sprintStatusLabels } from "@/lib/labels";
import { sprintStatusTone } from "@/lib/status-tones";

type SprintSummaryItem = {
  id: string;
  name: string;
  goal: string | null;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  tasks: { status: TaskStatus }[];
};

// Klien hanya melihat ringkasan tiap tahap (jumlah pekerjaan selesai), tanpa rincian task teknis.
export function SprintSummary({ sprints }: { sprints: SprintSummaryItem[] }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Tahapan Pekerjaan</CardTitle>
        <CardDescription>Proyek dikerjakan bertahap. Berikut perkembangan setiap tahap.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {sprints.length === 0 ? (
          <p className="px-5 py-8 text-center text-muted-foreground">Tahapan pekerjaan sedang disusun oleh tim kami.</p>
        ) : (
          <ol className="divide-y">
            {sprints.map((sprint) => {
              const done = sprint.tasks.filter((task) => task.status === "DONE").length;
              return (
                <li key={sprint.id} className="space-y-1 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{sprint.name}</p>
                    <StatusBadge tone={sprintStatusTone[sprint.status]}>{sprintStatusLabels[sprint.status]}</StatusBadge>
                  </div>
                  {sprint.goal && <p className="wrap-break-word">{sprint.goal}</p>}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)} ·{" "}
                    {sprint.tasks.length === 0
                      ? "Belum ada pekerjaan"
                      : `${done} dari ${sprint.tasks.length} pekerjaan selesai`}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
