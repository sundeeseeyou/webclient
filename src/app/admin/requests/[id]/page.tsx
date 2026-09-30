import { notFound } from "next/navigation";
import { RequestActions } from "@/components/admin/requests/request-actions";
import { RequestInfoCard } from "@/components/admin/requests/request-info-card";
import { RequestResponseCard } from "@/components/admin/requests/request-response-card";
import { PageHeader } from "@/components/shared/page-header";
import { navLabels, requestTypeLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { isOverdue } from "@/lib/sla";

export default async function AdminRequestDetailPage({ params }: PageProps<"/admin/requests/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const request = await prisma.slaRequest.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, company: true } },
      website: { select: { id: true, domain: true } },
      project: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
    },
  });
  if (!request) notFound();

  return (
    <>
      <PageHeader
        title={request.title}
        description={`${request.client.company} · ${requestTypeLabels[request.type]}`}
        breadcrumbs={[{ label: navLabels.requests, href: "/admin/requests" }, { label: request.title }]}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <RequestInfoCard request={{ ...request, overdue: isOverdue(request) }} />
        </div>
        <div className="min-w-0 space-y-6">
          {/* key: textarea tanggapan dikosongkan setiap kali status berubah. */}
          <RequestActions key={request.status} requestId={request.id} status={request.status} />
          <RequestResponseCard adminResponse={request.adminResponse} rejectionReason={request.rejectionReason} />
        </div>
      </div>
    </>
  );
}
