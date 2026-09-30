import Link from "next/link";
import { PiKanban, PiPlus } from "react-icons/pi";
import { ProjectFilters } from "@/components/admin/project-filters";
import { ProjectTable } from "@/components/admin/project-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { navLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { listProjects, parseProjectStatus } from "@/lib/projects";
import { requireAdmin } from "@/lib/rbac";

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  await requireAdmin();
  const query = await searchParams;
  const status = parseProjectStatus(query.status);
  const clientId = typeof query.clientId === "string" && query.clientId ? query.clientId : undefined;

  const [projects, clients] = await Promise.all([
    listProjects({ status, clientId }),
    prisma.client.findMany({ orderBy: { company: "asc" }, select: { id: true, company: true } }),
  ]);
  const isFiltered = Boolean(status || clientId);

  return (
    <>
      <PageHeader
        title={navLabels.projects}
        description="Semua proyek klien beserta status dan progresnya."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">
              <PiPlus />
              Tambah Proyek
            </Link>
          </Button>
        }
      />
      <ProjectFilters clients={clients} status={status} clientId={clientId} />
      {projects.length > 0 ? (
        <ProjectTable projects={projects} />
      ) : (
        <EmptyState
          icon={PiKanban}
          title={isFiltered ? "Tidak ada proyek yang sesuai filter" : "Belum ada proyek"}
          description={
            isFiltered ? "Coba ubah atau hapus filter status dan klien." : "Klik 'Tambah Proyek' untuk membuat proyek pertama."
          }
        />
      )}
    </>
  );
}
