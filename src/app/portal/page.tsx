import { PageHeader } from "@/components/shared/page-header";
import { navLabels, uiText } from "@/lib/labels";
import { requireClient } from "@/lib/rbac";

export default async function PortalDashboardPage() {
  const user = await requireClient();
  return <PageHeader title={navLabels.dashboard} description={uiText.greeting(user.name)} />;
}
