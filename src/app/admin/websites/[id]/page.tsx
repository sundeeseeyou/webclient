import { notFound } from "next/navigation";
import { ArticleList } from "@/components/admin/websites/article-list";
import { StatForm } from "@/components/admin/websites/stat-form";
import { WebsiteInfoCard } from "@/components/admin/websites/website-info-card";
import { PageHeader } from "@/components/shared/page-header";
import { VisitorChart } from "@/components/shared/visitor-chart";
import { WebsiteStatTable } from "@/components/shared/website-stat-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toMonthInputValue } from "@/lib/dates";
import { navLabels, platformLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { monthlySeries } from "@/lib/website-stats";

export default async function AdminWebsitePage({ params }: PageProps<"/admin/websites/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const now = new Date();

  const [website, activeClients] = await Promise.all([
    prisma.website.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, company: true, isActive: true } },
        stats: { orderBy: { period: "desc" } },
        articles: { orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { title: "asc" }] },
      },
    }),
    prisma.client.findMany({ where: { isActive: true }, select: { id: true, company: true }, orderBy: { company: "asc" } }),
  ]);
  if (!website) notFound();

  const { client, stats, articles, ...info } = website;
  // Klien pemilik tetap ada di pilihan walaupun sudah nonaktif, agar form ubah tetap valid.
  const clientOptions = client.isActive ? activeClients : [{ id: client.id, company: client.company }, ...activeClients];

  return (
    <>
      <PageHeader
        title={website.domain}
        description={`${platformLabels[website.platform]} · ${client.company}`}
        breadcrumbs={[
          { label: navLabels.clients, href: "/admin/clients" },
          { label: client.company, href: `/admin/clients/${client.id}` },
          { label: website.domain },
        ]}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <WebsiteInfoCard website={info} clients={clientOptions} now={now} />
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Pengunjung 6 bulan terakhir</CardTitle>
            <CardDescription>Jumlah pengunjung per bulan dari data statistik.</CardDescription>
          </CardHeader>
          <CardContent>
            <VisitorChart data={monthlySeries(stats, now)} height={360} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <StatForm
          websiteId={website.id}
          currentMonth={toMonthInputValue(now)}
          stats={stats.map((stat) => ({ month: toMonthInputValue(stat.period), visitors: stat.visitors, pageviews: stat.pageviews }))}
          className="self-start"
        />
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Riwayat statistik</CardTitle>
          </CardHeader>
          <CardContent className={stats.length > 0 ? "px-0" : undefined}>
            <WebsiteStatTable stats={stats} showSource emptyDescription="Isi form input statistik untuk mencatat bulan pertama." />
          </CardContent>
        </Card>
      </div>
      <ArticleList
        className="mt-6"
        websiteId={website.id}
        articles={articles}
        canSyncWordPress={Boolean(website.wpApiUrl)}
      />
    </>
  );
}
