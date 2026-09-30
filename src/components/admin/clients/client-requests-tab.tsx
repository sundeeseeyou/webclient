import { PiTray } from "react-icons/pi";
import { RequestTable } from "@/components/admin/requests/request-table";
import { EmptyState } from "@/components/shared/empty-state";
import type { RequestListItem } from "@/lib/requests";

export function ClientRequestsTab({ requests }: { requests: RequestListItem[] }) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={PiTray}
        title="Belum ada permintaan dari klien ini"
        description="Permintaan yang diajukan klien lewat portal akan tampil di sini."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Yang melewati batas waktu respon tampil paling atas. Klik baris untuk meninjau permintaan.
      </p>
      <RequestTable requests={requests} showClient={false} />
    </div>
  );
}
