import { navLabels, uiText } from "@/lib/labels";
import { requireClient } from "@/lib/rbac";

export default async function PortalDashboardPage() {
  const user = await requireClient();
  return (
    <div>
      <h1 className="text-xl font-semibold">{navLabels.dashboard}</h1>
      <p className="mt-1 text-muted-foreground">{uiText.greeting(user.name)}</p>
    </div>
  );
}
