import Link from "next/link";
import { PiKanban, PiPlus } from "react-icons/pi";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableLinkRow } from "@/components/shared/table-link-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ClientDetail } from "@/lib/clients";
import { formatDate } from "@/lib/format";
import { projectStatusLabels, projectTypeLabels } from "@/lib/labels";
import { projectStatusTone } from "@/lib/status-tones";

type ClientProjectsTabProps = {
  clientId: string;
  projects: ClientDetail["projects"];
};

export function ClientProjectsTab({ clientId, projects }: ClientProjectsTabProps) {
  const addButton = (
    <Button asChild>
      <Link href={`/admin/projects/new?clientId=${clientId}`}>
        <PiPlus className="size-5" />
        Tambah Proyek
      </Link>
    </Button>
  );

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={PiKanban}
        title="Belum ada proyek untuk klien ini"
        description="Klik 'Tambah Proyek' untuk mulai mencatat pekerjaan, sprint, dan task."
        action={addButton}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">Riwayat proyek, dari yang terbaru. Klik baris untuk membuka papan sprint.</p>
        {addButton}
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama proyek</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-44">Progres</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Target selesai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const href = `/admin/projects/${project.id}`;
              return (
                <TableLinkRow key={project.id} href={href}>
                  <TableCell>
                    <Link href={href} className="font-medium transition-colors hover:text-primary">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>{projectTypeLabels[project.type]}</TableCell>
                  <TableCell>
                    <StatusBadge tone={projectStatusTone[project.status]}>{projectStatusLabels[project.status]}</StatusBadge>
                  </TableCell>
                  <TableCell className="min-w-40">
                    <ProgressBar value={project.progress} label={`Progres ${project.name}`} />
                  </TableCell>
                  <TableCell>{formatDate(project.startDate)}</TableCell>
                  <TableCell>{project.endDate ? formatDate(project.endDate) : "-"}</TableCell>
                </TableLinkRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
