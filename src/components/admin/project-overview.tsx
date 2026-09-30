import type { Project } from "@prisma/client";
import Link from "next/link";
import { ProjectDeleteButton } from "@/components/admin/project-delete-button";
import { ProjectEditDialog } from "@/components/admin/project-edit-dialog";
import type { ClientOption } from "@/components/admin/project-form";
import { ProjectStatusSelect } from "@/components/admin/project-status-select";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toDateInputValue } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { projectStatusLabels, projectTypeLabels } from "@/lib/labels";
import { projectStatusTone } from "@/lib/status-tones";

type ProjectOverviewProps = {
  project: Project & { client: ClientOption; website: { id: string; domain: string } | null };
  progress: number;
  taskCount: number;
  doneCount: number;
};

function InfoItem({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 wrap-break-word">{children}</dd>
    </div>
  );
}

const linkClass = "font-medium text-primary hover:underline";

export function ProjectOverview({ project, progress, taskCount, doneCount }: ProjectOverviewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="border-b">
          <CardTitle>Informasi Proyek</CardTitle>
          <CardAction className="col-start-1 row-start-2 flex flex-wrap gap-2 justify-self-start sm:col-start-2 sm:row-start-1 sm:justify-self-end">
            <ProjectEditDialog
              projectId={project.id}
              client={project.client}
              defaultValues={{
                name: project.name,
                description: project.description ?? "",
                type: project.type,
                clientId: project.clientId,
                websiteId: project.websiteId ?? "",
                startDate: toDateInputValue(project.startDate),
                endDate: project.endDate ? toDateInputValue(project.endDate) : "",
              }}
            />
            <ProjectDeleteButton projectId={project.id} projectName={project.name} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <InfoItem label="Klien">
              <Link href={`/admin/clients/${project.clientId}`} className={linkClass}>
                {project.client.company}
              </Link>
            </InfoItem>
            <InfoItem label="Website">
              {project.website ? (
                <Link href={`/admin/websites/${project.website.id}`} className={linkClass}>
                  {project.website.domain}
                </Link>
              ) : (
                "Tanpa website"
              )}
            </InfoItem>
            <InfoItem label="Jenis proyek">{projectTypeLabels[project.type]}</InfoItem>
            <InfoItem label="Jadwal">
              {formatDate(project.startDate)} – {project.endDate ? formatDate(project.endDate) : "belum ditentukan"}
            </InfoItem>
            {project.approvedAt && <InfoItem label="Disetujui klien">{formatDate(project.approvedAt)}</InfoItem>}
            <InfoItem label="Deskripsi" className="sm:col-span-2">
              <span className="whitespace-pre-line">{project.description || "Belum ada deskripsi."}</span>
            </InfoItem>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Status &amp; Progres</CardTitle>
          <CardAction>
            <StatusBadge tone={projectStatusTone[project.status]}>{projectStatusLabels[project.status]}</StatusBadge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-5">
          <ProjectStatusSelect key={project.status} projectId={project.id} status={project.status} />
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Progres proyek</p>
            <ProgressBar value={progress} label="Progres proyek" />
            <p className="text-xs text-muted-foreground">
              {taskCount === 0 ? "Belum ada task di sprint mana pun." : `${doneCount} dari ${taskCount} task selesai.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
