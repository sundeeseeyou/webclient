import { navLabels, uiText } from "@/lib/labels";
import { requireAdmin } from "@/lib/rbac";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  return (
    <div>
      <h1 className="text-xl font-semibold">{navLabels.dashboard}</h1>
      <p className="mt-1 text-muted-foreground">{uiText.greeting(user.name)}</p>
    </div>
  );
}
