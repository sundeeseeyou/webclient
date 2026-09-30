import { notFound } from "next/navigation";
import { PublishedArticleList } from "@/components/portal/published-article-list";
import { WebsiteStatCards } from "@/components/portal/website-stat-cards";
import { PageHeader } from "@/components/shared/page-header";
import { RenewalInfo } from "@/components/shared/renewal-info";
import { StatusBadge } from "@/components/shared/status-badge";
import { VisitorChart } from "@/components/shared/visitor-chart";
import { WebsiteStatTable } from "@/components/shared/website-stat-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { navLabels, platformLabels, websiteStatusLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/rbac";
import { websiteStatusTone } from "@/lib/status-tones";
import { monthlySeries } from "@/lib/website-stats";

export default async function PortalWebsitePage({ params }: PageProps<"/portal/websites/[id]">) {
  const user = await requireClient();
  const { id } = await params;
  const now = new Date();

  // Website klien lain tidak ditemukan dengan filter clientId dari session, sehingga tampil 404 (BB-04).
  const website = await prisma.website.findFirst({
    where: { id, clientId: user.clientId },
    include: {
      stats: { orderBy: { period: "desc" } },
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { title: "asc" }],
        select: { id: true, title: true, url: true, publishedAt: true },
      },
    },
  });
  if (!website) notFound();

  const series = monthlySeries(website.stats, now);

  return (
    <>
      <PageHeader
        title={website.domain}
        description={platformLabels[website.platform]}
        breadcrumbs={[{ label: navLabels.dashboard, href: "/portal" }, { label: website.domain }]}
        actions={<StatusBadge tone={websiteStatusTone[website.status]}>{websiteStatusLabels[website.status]}</StatusBadge>}
      />
      <WebsiteStatCards series={series} publishedArticles={website.articles.length} />
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Pengunjung 6 bulan terakhir</CardTitle>
            <CardDescription>Arahkan kursor atau ketuk batang untuk melihat angka tiap bulan.</CardDescription>
          </CardHeader>
          <CardContent>
            <VisitorChart data={series} height={280} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Masa aktif</CardTitle>
            <CardDescription>Tim Boowat akan mengingatkan sebelum masa aktif habis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <RenewalInfo label="Domain" date={website.domainRenewAt} now={now} />
            <RenewalInfo label="Hosting" date={website.hostingRenewAt} detail={website.hostingProvider} now={now} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Statistik bulanan</CardTitle>
          </CardHeader>
          <CardContent className={website.stats.length > 0 ? "px-0" : undefined}>
            <WebsiteStatTable stats={website.stats} emptyDescription="Data pengunjung akan diisi oleh tim Boowat setiap bulan." />
          </CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Artikel terbit</CardTitle>
            <CardDescription>{website.articles.length} artikel</CardDescription>
          </CardHeader>
          <CardContent>
            <PublishedArticleList articles={website.articles} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
