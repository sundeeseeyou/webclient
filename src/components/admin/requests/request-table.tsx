import Link from "next/link";
import { OverdueBadge } from "@/components/admin/requests/overdue-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableLinkRow } from "@/components/shared/table-link-row";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/format";
import { requestPriorityLabels, requestStatusLabels, requestTypeLabels } from "@/lib/labels";
import type { RequestListItem } from "@/lib/requests";
import { requestStatusTone } from "@/lib/status-tones";

type RequestTableProps = {
  requests: RequestListItem[];
  // Di tab detail klien kolom klien disembunyikan karena semua baris milik klien yang sama.
  showClient?: boolean;
};

export function RequestTable({ requests, showClient = true }: RequestTableProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Judul</TableHead>
            {showClient && <TableHead>Klien</TableHead>}
            <TableHead>Website</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Prioritas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Batas respon</TableHead>
            <TableHead>Dibuat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const href = `/admin/requests/${request.id}`;
            return (
              <TableLinkRow key={request.id} href={href}>
                <TableCell className="min-w-56 whitespace-normal">
                  <Link href={href} className="font-medium transition-colors hover:text-primary">
                    {request.title}
                  </Link>
                  {request.project && <p className="text-xs text-muted-foreground">Proyek: {request.project.name}</p>}
                </TableCell>
                {showClient && <TableCell>{request.client.company}</TableCell>}
                <TableCell>{request.website?.domain ?? "-"}</TableCell>
                <TableCell>{requestTypeLabels[request.type]}</TableCell>
                <TableCell>{requestPriorityLabels[request.priority]}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge tone={requestStatusTone[request.status]}>{requestStatusLabels[request.status]}</StatusBadge>
                    {request.overdue && <OverdueBadge />}
                  </div>
                </TableCell>
                <TableCell>{formatDateTime(request.dueAt)}</TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
              </TableLinkRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
