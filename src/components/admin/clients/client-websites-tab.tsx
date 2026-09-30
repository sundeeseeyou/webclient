import Link from "next/link";
import { PiGlobe, PiPlus } from "react-icons/pi";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableLinkRow } from "@/components/shared/table-link-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ClientDetail } from "@/lib/clients";
import { formatDate } from "@/lib/format";
import { platformLabels, websiteStatusLabels } from "@/lib/labels";
import { websiteStatusTone } from "@/lib/status-tones";

type ClientWebsitesTabProps = {
  clientId: string;
  websites: ClientDetail["websites"];
};

export function ClientWebsitesTab({ clientId, websites }: ClientWebsitesTabProps) {
  const addButton = (
    <Button asChild>
      <Link href={`/admin/websites/new?clientId=${clientId}`}>
        <PiPlus className="size-5" />
        Tambah Website
      </Link>
    </Button>
  );

  if (websites.length === 0) {
    return (
      <EmptyState
        icon={PiGlobe}
        title="Klien ini belum punya website"
        description="Klik 'Tambah Website' untuk mencatat domain, hosting, dan masa aktifnya."
        action={addButton}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">Klik baris untuk melihat statistik dan artikel website.</p>
        {addButton}
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Domain</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Domain aktif sampai</TableHead>
              <TableHead>Hosting aktif sampai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {websites.map((website) => {
              const href = `/admin/websites/${website.id}`;
              return (
                <TableLinkRow key={website.id} href={href}>
                  <TableCell>
                    <Link href={href} className="font-medium transition-colors hover:text-primary">
                      {website.domain}
                    </Link>
                  </TableCell>
                  <TableCell>{platformLabels[website.platform]}</TableCell>
                  <TableCell>
                    <StatusBadge tone={websiteStatusTone[website.status]}>{websiteStatusLabels[website.status]}</StatusBadge>
                  </TableCell>
                  <TableCell>{website.domainRenewAt ? formatDate(website.domainRenewAt) : "-"}</TableCell>
                  <TableCell>{website.hostingRenewAt ? formatDate(website.hostingRenewAt) : "-"}</TableCell>
                </TableLinkRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
