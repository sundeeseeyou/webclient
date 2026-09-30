import type { Website } from "@prisma/client";
import { WebsiteDeleteButton } from "@/components/admin/websites/website-delete-button";
import { WebsiteEditDialog } from "@/components/admin/websites/website-edit-dialog";
import type { ClientOption } from "@/components/admin/websites/website-form";
import { RenewalInfo } from "@/components/shared/renewal-info";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toDateInputValue } from "@/lib/dates";
import { platformLabels, websiteStatusLabels } from "@/lib/labels";
import { websiteStatusTone } from "@/lib/status-tones";

type WebsiteInfoCardProps = {
  website: Website;
  clients: ClientOption[];
  now: Date;
  className?: string;
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right wrap-break-word">{children}</dd>
    </div>
  );
}

export function WebsiteInfoCard({ website, clients, now, className }: WebsiteInfoCardProps) {
  const defaultValues = {
    clientId: website.clientId,
    domain: website.domain,
    platform: website.platform,
    hostingProvider: website.hostingProvider ?? "",
    hostingRenewAt: website.hostingRenewAt ? toDateInputValue(website.hostingRenewAt) : "",
    domainRenewAt: website.domainRenewAt ? toDateInputValue(website.domainRenewAt) : "",
    status: website.status,
    ga4PropertyId: website.ga4PropertyId ?? "",
    wpApiUrl: website.wpApiUrl ?? "",
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>Domain &amp; hosting</CardTitle>
        <div className="flex gap-2">
          <WebsiteEditDialog websiteId={website.id} clients={clients} defaultValues={defaultValues} />
          <WebsiteDeleteButton websiteId={website.id} domain={website.domain} clientId={website.clientId} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <RenewalInfo label="Masa aktif domain" date={website.domainRenewAt} now={now} />
          <RenewalInfo label="Masa aktif hosting" date={website.hostingRenewAt} detail={website.hostingProvider} now={now} />
        </div>
        <dl className="divide-y">
          <InfoRow label="Status">
            <StatusBadge tone={websiteStatusTone[website.status]}>{websiteStatusLabels[website.status]}</StatusBadge>
          </InfoRow>
          <InfoRow label="Platform">{platformLabels[website.platform]}</InfoRow>
          <InfoRow label="Penyedia hosting">{website.hostingProvider ?? "-"}</InfoRow>
          <InfoRow label="ID properti GA4">{website.ga4PropertyId ?? "Belum diatur"}</InfoRow>
          <InfoRow label="API WordPress">{website.wpApiUrl ?? "Belum diatur"}</InfoRow>
        </dl>
      </CardContent>
    </Card>
  );
}
