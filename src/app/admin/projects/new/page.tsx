import { ProjectForm } from "@/components/admin/project-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { toDateInputValue } from "@/lib/dates";
import { navLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

export default async function NewProjectPage({ searchParams }: PageProps<"/admin/projects/new">) {
  await requireAdmin();
  const { clientId } = await searchParams;

  // Proyek baru hanya untuk klien aktif; website dimuat sekalian agar pilihan website langsung tersedia.
  const clients = await prisma.client.findMany({
    where: { isActive: true },
    orderBy: { company: "asc" },
    select: { id: true, company: true, websites: { orderBy: { domain: "asc" }, select: { id: true, domain: true } } },
  });
  const prefillClientId = clients.find((client) => client.id === clientId)?.id ?? "";

  return (
    <>
      <PageHeader
        title="Tambah Proyek"
        description="Isi data proyek. Sprint dan task bisa ditambahkan setelah proyek dibuat."
        breadcrumbs={[{ label: navLabels.projects, href: "/admin/projects" }, { label: "Tambah Proyek" }]}
      />
      <Card className="max-w-3xl">
        <CardContent>
          <ProjectForm
            clients={clients}
            defaultValues={{
              name: "",
              description: "",
              clientId: prefillClientId,
              websiteId: "",
              startDate: toDateInputValue(new Date()),
              endDate: "",
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
