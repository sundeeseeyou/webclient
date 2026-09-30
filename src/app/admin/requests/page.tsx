import { PiTray } from "react-icons/pi";
import { RequestFilters } from "@/components/admin/requests/request-filters";
import { RequestTable } from "@/components/admin/requests/request-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { navLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { hasActiveFilter, listRequests, parseRequestFilters, requestFilterWhere } from "@/lib/requests";

export default async function AdminRequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  await requireAdmin();
  const filters = parseRequestFilters(await searchParams);

  const [requests, clients] = await Promise.all([
    listRequests(requestFilterWhere(filters)),
    prisma.client.findMany({ orderBy: { company: "asc" }, select: { id: true, company: true } }),
  ]);
  const isFiltered = hasActiveFilter(filters);

  return (
    <>
      <PageHeader
        title={navLabels.requests}
        description="Permintaan perubahan dari klien. Yang melewati batas waktu respon tampil paling atas."
      />
      <RequestFilters clients={clients} {...filters} />
      {requests.length > 0 ? (
        <RequestTable requests={requests} />
      ) : (
        <EmptyState
          icon={PiTray}
          title={isFiltered ? "Tidak ada permintaan yang sesuai filter" : "Belum ada permintaan"}
          description={
            isFiltered
              ? "Coba ubah atau hapus filter status, prioritas, dan klien."
              : "Permintaan yang diajukan klien lewat portal akan tampil di sini."
          }
        />
      )}
    </>
  );
}
