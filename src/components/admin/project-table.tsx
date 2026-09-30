import Link from "next/link";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { projectStatusLabels, projectTypeLabels } from "@/lib/labels";
import type { ProjectListItem } from "@/lib/projects";
import { projectStatusTone } from "@/lib/status-tones";

export function ProjectTable({ projects }: { projects: ProjectListItem[] }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Proyek</TableHead>
            <TableHead>Klien &amp; Website</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progres</TableHead>
            <TableHead>Jadwal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="min-w-56 whitespace-normal">
                <Link href={`/admin/projects/${project.id}`} className="font-medium hover:text-primary hover:underline">
                  {project.name}
                </Link>
                <p className="text-xs text-muted-foreground">{projectTypeLabels[project.type]}</p>
              </TableCell>
              <TableCell>
                <p>{project.client.company}</p>
                <p className="text-xs text-muted-foreground">{project.website?.domain ?? "Tanpa website"}</p>
              </TableCell>
              <TableCell>
                <StatusBadge tone={projectStatusTone[project.status]}>{projectStatusLabels[project.status]}</StatusBadge>
              </TableCell>
              <TableCell className="min-w-40">
                <ProgressBar value={project.progress} />
              </TableCell>
              <TableCell>
                <p>{formatDate(project.startDate)}</p>
                <p className="text-xs text-muted-foreground">
                  {project.endDate ? `s.d. ${formatDate(project.endDate)}` : "Selesai belum ditentukan"}
                </p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
