import type { ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { projectStatusLabels } from "@/lib/labels";
import { projectStatusTone } from "@/lib/status-tones";

type ActiveProject = { id: string; name: string; status: ProjectStatus; progress: number };

export function ActiveProjectList({ projects }: { projects: ActiveProject[] }) {
  if (projects.length === 0) {
    return <p className="text-muted-foreground">Tidak ada proyek yang sedang berjalan.</p>;
  }

  return (
    <ul className="space-y-2">
      {projects.map((project) => (
        <li key={project.id}>
          <Link
            href={`/portal/projects/${project.id}`}
            className="block rounded-lg border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-0 font-medium wrap-break-word">{project.name}</span>
              <StatusBadge tone={projectStatusTone[project.status]}>{projectStatusLabels[project.status]}</StatusBadge>
            </div>
            <div className="mt-3">
              <ProgressBar value={project.progress} label={`Progres ${project.name}`} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
