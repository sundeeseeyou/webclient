import Link from "next/link";
import { PiPlus, PiTray } from "react-icons/pi";
import { RequestCard } from "@/components/portal/request-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { navLabels } from "@/lib/labels";
import { requireClient } from "@/lib/rbac";
import { listRequests } from "@/lib/requests";

export default async function PortalRequestsPage() {
  const user = await requireClient();
  const requests = await listRequests({ clientId: user.clientId }, "newest");

  return (
    <>
      <PageHeader
        title={navLabels.requests}
        description="Ajukan perubahan untuk website Anda dan pantau tanggapan tim Boowat."
        actions={
          <Button asChild>
            <Link href="/portal/requests/new">
              <PiPlus />
              Ajukan Permintaan
            </Link>
          </Button>
        }
      />
      {requests.length === 0 ? (
        <EmptyState icon={PiTray} title="Belum ada permintaan. Klik 'Ajukan Permintaan' untuk memulai." />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </>
  );
}
