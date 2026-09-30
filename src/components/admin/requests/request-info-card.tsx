import type { SlaRequest } from "@prisma/client";
import { cn } from "cn";
import Link from "next/link";
import { OverdueBadge } from "@/components/admin/requests/overdue-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { requestPriorityLabels, requestStatusLabels, requestTypeLabels } from "@/lib/labels";
import { slaTargetLabel } from "@/lib/sla";
import { requestStatusTone } from "@/lib/status-tones";

type RequestInfoCardProps = {
  request: SlaRequest & {
    overdue: boolean;
    client: { id: string; company: string };
    website: { id: string; domain: string } | null;
    project: { id: string; name: string } | null;
    createdBy: { name: string };
  };
};

const linkClass = "font-medium text-primary hover:underline";

function InfoItem({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 wrap-break-word">{children}</dd>
    </div>
  );
}

function SlaStatus({ request }: RequestInfoCardProps) {
  if (request.respondedAt) {
    const late = request.respondedAt.getTime() > request.dueAt.getTime();
    return (
      <span className="text-muted-foreground">
        Direspons pada {formatDateTime(request.respondedAt)}
        {late && " (melewati batas respon)"}
      </span>
    );
  }
  return request.overdue ? <OverdueBadge /> : <StatusBadge tone="success">Tepat waktu</StatusBadge>;
}

export function RequestInfoCard({ request }: RequestInfoCardProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Detail Permintaan</CardTitle>
        <CardAction>
          <StatusBadge tone={requestStatusTone[request.status]}>{requestStatusLabels[request.status]}</StatusBadge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-5 sm:grid-cols-2">
          <InfoItem label="Klien">
            <Link href={`/admin/clients/${request.client.id}`} className={linkClass}>
              {request.client.company}
            </Link>
          </InfoItem>
          <InfoItem label="Website">
            {request.website ? (
              <Link href={`/admin/websites/${request.website.id}`} className={linkClass}>
                {request.website.domain}
              </Link>
            ) : (
              "Tanpa website"
            )}
          </InfoItem>
          <InfoItem label="Proyek">
            {request.project ? (
              <Link href={`/admin/projects/${request.project.id}`} className={linkClass}>
                {request.project.name}
              </Link>
            ) : (
              "Tidak terkait proyek"
            )}
          </InfoItem>
          <InfoItem label="Jenis">{requestTypeLabels[request.type]}</InfoItem>
          <InfoItem label="Prioritas">
            {requestPriorityLabels[request.priority]} (target respon {slaTargetLabel(request.priority)})
          </InfoItem>
          <InfoItem label="Dibuat">
            {formatDateTime(request.createdAt)} oleh {request.createdBy.name}
          </InfoItem>
          <InfoItem label="Batas respon">
            <span className="flex flex-wrap items-center gap-2">
              {formatDateTime(request.dueAt)}
              <SlaStatus request={request} />
            </span>
          </InfoItem>
          {request.resolvedAt && (
            <InfoItem label={request.status === "REJECTED" ? "Ditolak pada" : "Selesai pada"}>
              {formatDateTime(request.resolvedAt)}
            </InfoItem>
          )}
          <InfoItem label="Tautan referensi" className="sm:col-span-2">
            {request.referenceUrl ? (
              <a href={request.referenceUrl} target="_blank" rel="noopener noreferrer" className={cn(linkClass, "break-all")}>
                {request.referenceUrl}
              </a>
            ) : (
              "Tidak ada"
            )}
          </InfoItem>
          <InfoItem label="Deskripsi" className="sm:col-span-2">
            <span className="whitespace-pre-line">{request.description}</span>
          </InfoItem>
        </dl>
      </CardContent>
    </Card>
  );
}
