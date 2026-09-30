import Link from "next/link";
import { PiArrowRight, PiTray } from "react-icons/pi";
import { DashboardListCard } from "@/components/admin/dashboard/dashboard-list-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { RecentRequest } from "@/lib/admin-dashboard";
import { formatDateTime } from "@/lib/format";
import { requestStatusLabels } from "@/lib/labels";
import { requestStatusTone } from "@/lib/status-tones";

export function RecentRequests({ requests }: { requests: RecentRequest[] }) {
  return (
    <DashboardListCard
      title="Permintaan terbaru"
      description="Lima permintaan klien yang paling baru masuk."
      action={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/requests">
            Lihat semua
            <PiArrowRight />
          </Link>
        </Button>
      }
    >
      {requests.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={PiTray}
            title="Belum ada permintaan"
            description="Permintaan yang diajukan klien dari portal akan muncul di sini."
          />
        </div>
      ) : (
        <ul className="divide-y">
          {requests.map((request) => (
            <li key={request.id}>
              <Link
                href={`/admin/requests/${request.id}`}
                className="grid grid-cols-1 gap-y-1 px-5 py-3.5 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-4"
              >
                <p className="font-medium wrap-break-word">{request.title}</p>
                <div className="order-last mt-1 flex flex-wrap items-start gap-1.5 sm:order-0 sm:mt-0 sm:justify-end">
                  {request.overdue && <StatusBadge tone="danger">Melewati SLA</StatusBadge>}
                  <StatusBadge tone={requestStatusTone[request.status]}>{requestStatusLabels[request.status]}</StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  {request.client.company}
                  {request.website && ` · ${request.website.domain}`}
                  {` · ${formatDateTime(request.createdAt)}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardListCard>
  );
}
