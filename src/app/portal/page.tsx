import { cn } from "cn";
import { PiGlobe } from "react-icons/pi";
import { ApprovalBanner } from "@/components/portal/approval-banner";
import { WebsiteSummaryCard } from "@/components/portal/website-summary-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { navLabels, uiText } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { progressSelect, projectProgress } from "@/lib/progress";
import { requireClient } from "@/lib/rbac";
import { chartRangeStart, monthlySeries } from "@/lib/website-stats";

export default async function PortalDashboardPage() {
  const user = await requireClient();
  const now = new Date();

  // Semua query dibatasi clientId dari session, bukan dari URL.
  const [websites, waitingProjects] = await Promise.all([
    prisma.website.findMany({
      where: { clientId: user.clientId },
      orderBy: { createdAt: "asc" },
      include: {
        stats: { where: { period: { gte: chartRangeStart(now) } } },
        _count: { select: { articles: { where: { status: "PUBLISHED" } } } },
        projects: {
          where: { clientId: user.clientId, status: { not: "DONE" } },
          orderBy: { startDate: "desc" },
          select: { id: true, name: true, status: true, ...progressSelect },
        },
      },
    }),
    prisma.project.findMany({
      where: { clientId: user.clientId, status: "WAITING_APPROVAL" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <PageHeader title={navLabels.dashboard} description={uiText.greeting(user.name)} />
      <ApprovalBanner projects={waitingProjects} />
      {websites.length === 0 ? (
        <EmptyState
          icon={PiGlobe}
          title="Belum ada website"
          description="Website Anda akan tampil di sini setelah didaftarkan oleh tim Boowat."
        />
      ) : (
        <div className={cn("grid grid-cols-1 gap-6", websites.length > 1 && "xl:grid-cols-2")}>
          {websites.map((website) => (
            <WebsiteSummaryCard
              key={website.id}
              wide={websites.length === 1}
              now={now}
              website={{
                ...website,
                series: monthlySeries(website.stats, now),
                publishedArticles: website._count.articles,
                projects: website.projects.map((project) => ({
                  id: project.id,
                  name: project.name,
                  status: project.status,
                  progress: projectProgress(project),
                })),
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
