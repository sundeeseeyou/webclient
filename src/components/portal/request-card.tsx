import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDateTime } from "@/lib/format";
import { requestPriorityLabels, requestStatusLabels, requestTypeLabels } from "@/lib/labels";
import type { RequestListItem } from "@/lib/requests";
import { requestStatusTone } from "@/lib/status-tones";

function InfoItem({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

export function RequestCard({ request }: { request: RequestListItem }) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold wrap-break-word">{request.title}</h2>
          <p className="text-muted-foreground">
            {requestTypeLabels[request.type]} · {request.website?.domain ?? "Tanpa website"}
            {request.project && ` · Proyek ${request.project.name}`}
          </p>
        </div>
        <StatusBadge tone={requestStatusTone[request.status]} className="self-start">
          {requestStatusLabels[request.status]}
        </StatusBadge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <InfoItem label="Tanggal diajukan">{formatDate(request.createdAt)}</InfoItem>
        <InfoItem label="Prioritas">{requestPriorityLabels[request.priority]}</InfoItem>
        {request.respondedAt ? (
          <InfoItem label="Direspons" className="col-span-2 sm:col-span-1">
            {formatDateTime(request.respondedAt)}
          </InfoItem>
        ) : (
          <InfoItem label="Perkiraan waktu respon" className="col-span-2 sm:col-span-1">
            Sebelum {formatDateTime(request.dueAt)}
          </InfoItem>
        )}
      </dl>

      {request.status === "REJECTED" && request.rejectionReason && (
        <div className="mt-4 rounded-lg border border-danger/30 bg-danger/5 p-3">
          <p className="text-xs font-medium text-danger">Alasan penolakan</p>
          <p className="mt-1 whitespace-pre-line wrap-break-word">{request.rejectionReason}</p>
        </div>
      )}
      {request.adminResponse && (
        <div className="mt-4 rounded-lg border bg-muted/40 p-3">
          <p className="text-xs font-medium text-muted-foreground">Tanggapan tim Boowat</p>
          <p className="mt-1 whitespace-pre-line wrap-break-word">{request.adminResponse}</p>
        </div>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer font-medium text-primary">Lihat isi permintaan</summary>
        <p className="mt-2 whitespace-pre-line wrap-break-word">{request.description}</p>
        {request.referenceUrl && (
          <a
            href={request.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-medium break-all text-primary hover:underline"
          >
            {request.referenceUrl}
          </a>
        )}
      </details>
    </article>
  );
}
