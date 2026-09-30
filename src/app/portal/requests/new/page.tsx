import { RequestType } from "@prisma/client";
import { RequestForm } from "@/components/portal/request-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { navLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/rbac";

export default async function NewPortalRequestPage({ searchParams }: PageProps<"/portal/requests/new">) {
  const user = await requireClient();
  const query = await searchParams;
  const projectId = typeof query.projectId === "string" && query.projectId ? query.projectId : null;

  // Prefill proyek hanya dipakai bila proyek itu milik klien yang login; selain itu diabaikan.
  const [websites, project] = await Promise.all([
    prisma.website.findMany({ where: { clientId: user.clientId }, orderBy: { domain: "asc" }, select: { id: true, domain: true } }),
    projectId
      ? prisma.project.findFirst({
          where: { id: projectId, clientId: user.clientId },
          select: { id: true, name: true, websiteId: true },
        })
      : null,
  ]);
  const defaultType = Object.values(RequestType).find((type) => type === query.type);

  return (
    <>
      <PageHeader
        title="Ajukan Permintaan"
        description="Jelaskan perubahan yang Anda butuhkan. Tim Boowat akan merespons sesuai prioritas yang Anda pilih."
        breadcrumbs={[{ label: navLabels.requests, href: "/portal/requests" }, { label: "Ajukan Permintaan" }]}
      />
      <Card className="max-w-3xl">
        <CardContent>
          <RequestForm websites={websites} project={project} defaultType={defaultType} />
        </CardContent>
      </Card>
    </>
  );
}
