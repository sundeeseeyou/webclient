import { PiKanban } from "react-icons/pi";
import { ProjectCard } from "@/components/portal/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { navLabels } from "@/lib/labels";
import { listProjects } from "@/lib/projects";
import { requireClient } from "@/lib/rbac";

export default async function PortalProjectsPage() {
  const user = await requireClient();
  const projects = await listProjects({ clientId: user.clientId });

  return (
    <>
      <PageHeader title={navLabels.projects} description="Pantau perkembangan pekerjaan yang sedang dan sudah dikerjakan tim Boowat." />
      {projects.length === 0 ? (
        <EmptyState
          icon={PiKanban}
          title="Belum ada proyek"
          description="Proyek yang dikerjakan tim Boowat untuk Anda akan tampil di sini."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
