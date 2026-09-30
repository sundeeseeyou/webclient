import Link from "next/link";
import { projectStatusNotes } from "@/components/portal/project-text";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { projectStatusLabels, projectTypeLabels } from "@/lib/labels";
import type { ProjectListItem } from "@/lib/projects";
import { projectStatusTone } from "@/lib/status-tones";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link
      href={`/portal/projects/${project.id}`}
      className="block rounded-xl border bg-card p-5 shadow-xs transition-colors hover:border-primary/40"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold wrap-break-word">{project.name}</h2>
          <p className="text-muted-foreground">
            {project.website?.domain ?? "Tanpa website"} · {projectTypeLabels[project.type]}
          </p>
        </div>
        <StatusBadge tone={projectStatusTone[project.status]} className="self-start">
          {projectStatusLabels[project.status]}
        </StatusBadge>
      </div>
      <p className="mt-3">{projectStatusNotes[project.status]}</p>
      <div className="mt-4">
        <ProgressBar value={project.progress} label="Progres pekerjaan" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Mulai {formatDate(project.startDate)}
        {project.endDate && ` · Target selesai ${formatDate(project.endDate)}`}
      </p>
    </Link>
  );
}
