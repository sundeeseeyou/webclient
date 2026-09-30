import { RecentRequests } from "@/components/admin/dashboard/recent-requests";
import { SummaryCards } from "@/components/admin/dashboard/summary-cards";
import { UpcomingRenewals } from "@/components/admin/dashboard/upcoming-renewals";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminDashboard } from "@/lib/admin-dashboard";
import { navLabels, uiText } from "@/lib/labels";
import { requireAdmin } from "@/lib/rbac";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const now = new Date();
  const { summary, recentRequests, renewals } = await getAdminDashboard(now);

  return (
    <>
      <PageHeader title={navLabels.dashboard} description={uiText.greeting(user.name)} />
      <SummaryCards summary={summary} />
      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <RecentRequests requests={recentRequests} />
        <UpcomingRenewals renewals={renewals} now={now} />
      </div>
    </>
  );
}
