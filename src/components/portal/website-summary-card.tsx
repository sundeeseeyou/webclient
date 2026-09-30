import type { Platform, ProjectStatus, WebsiteStatus } from "@prisma/client";
import { cn } from "cn";
import Link from "next/link";
import { PiArrowRight, PiArticle, PiUsers } from "react-icons/pi";
import { ActiveProjectList } from "@/components/portal/active-project-list";
import { MonthChange } from "@/components/portal/month-change";
import { RenewalInfo } from "@/components/shared/renewal-info";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { VisitorChart } from "@/components/shared/visitor-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { platformLabels, websiteStatusLabels } from "@/lib/labels";
import { mostUrgentTone, type RenewalTone } from "@/lib/renewal";
import { websiteStatusTone } from "@/lib/status-tones";
import { compareWithPreviousMonth, formatNumber, type MonthlyPoint } from "@/lib/website-stats";

export type WebsiteSummary = {
  id: string;
  domain: string;
  platform: Platform;
  status: WebsiteStatus;
  hostingProvider: string | null;
  domainRenewAt: Date | null;
  hostingRenewAt: Date | null;
  series: MonthlyPoint[];
  publishedArticles: number;
  projects: { id: string; name: string; status: ProjectStatus; progress: number }[];
};

// Garis kartu ikut berwarna saat domain/hosting hampir habis, agar langsung terlihat dari beranda (BB-08).
const cardBorder: Record<RenewalTone, string> = {
  neutral: "",
  warning: "border-warning/50",
  danger: "border-danger/60",
};

type WebsiteSummaryCardProps = {
  website: WebsiteSummary;
  now: Date;
  // Klien dengan satu website mendapat kartu selebar halaman, isinya dibagi dua kolom di layar lebar.
  wide?: boolean;
};

export function WebsiteSummaryCard({ website, now, wide = false }: WebsiteSummaryCardProps) {
  const [previous, current] = website.series.slice(-2);
  const tone = mostUrgentTone([website.domainRenewAt, website.hostingRenewAt], now);
  const href = `/portal/websites/${website.id}`;

  return (
    <Card className={cn(cardBorder[tone])}>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-lg break-all">
            <Link href={href} className="transition-colors hover:text-primary">
              {website.domain}
            </Link>
          </CardTitle>
          <CardDescription>{platformLabels[website.platform]}</CardDescription>
        </div>
        <StatusBadge tone={websiteStatusTone[website.status]}>{websiteStatusLabels[website.status]}</StatusBadge>
      </CardHeader>
      <CardContent className={cn("grid grid-cols-1 gap-6", wide && "xl:grid-cols-2")}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <RenewalInfo label="Masa aktif domain" date={website.domainRenewAt} now={now} />
            <RenewalInfo label="Masa aktif hosting" date={website.hostingRenewAt} detail={website.hostingProvider} now={now} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              icon={PiUsers}
              label="Pengunjung bulan ini"
              value={current.visitors === null ? null : formatNumber(current.visitors)}
              className="shadow-none"
            >
              <MonthChange comparison={compareWithPreviousMonth(current.visitors, previous.visitors)} />
            </StatCard>
            <StatCard icon={PiArticle} label="Artikel terbit" value={formatNumber(website.publishedArticles)} className="shadow-none" />
          </div>
        </div>
        <section>
          <h3 className="mb-3 text-sm font-medium">Pengunjung 6 bulan terakhir</h3>
          <VisitorChart data={website.series} height={wide ? 240 : 200} />
        </section>
        <section className={cn(wide && "xl:col-span-2")}>
          <h3 className="mb-3 text-sm font-medium">Proyek berjalan</h3>
          <ActiveProjectList projects={website.projects} />
        </section>
      </CardContent>
      <CardFooter className="mt-auto border-t">
        <Button asChild variant="outline" size="sm">
          <Link href={href}>
            Lihat detail website
            <PiArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
