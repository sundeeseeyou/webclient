import { AppShell } from "@/components/shared/app-shell";
import { requireClient } from "@/lib/rbac";

export default async function PortalLayout({ children }: LayoutProps<"/portal">) {
  const user = await requireClient();
  return (
    <AppShell portal="portal" user={user}>
      {children}
    </AppShell>
  );
}
