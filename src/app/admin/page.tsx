import { PageHeader } from "@/components/shared/page-header";
import { navLabels, uiText } from "@/lib/labels";
import { requireAdmin } from "@/lib/rbac";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  return <PageHeader title={navLabels.dashboard} description={uiText.greeting(user.name)} />;
}
