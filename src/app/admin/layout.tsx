import { AppShell } from "@/components/shared/app-shell";
import { requireAdmin } from "@/lib/rbac";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  return (
    <AppShell portal="admin" user={user}>
      {children}
    </AppShell>
  );
}
