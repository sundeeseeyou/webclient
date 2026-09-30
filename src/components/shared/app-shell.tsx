import { cookies } from "next/headers";
import { Header } from "@/components/shared/header";
import { SIDEBAR_COOKIE, type Portal } from "@/components/shared/nav-items";
import { DesktopSidebar, MobileSidebar } from "@/components/shared/sidebar";
import { SidebarProvider } from "@/components/shared/sidebar-context";
import { getNotificationSummary } from "@/lib/notify";
import type { SessionUser } from "@/lib/rbac";

type AppShellProps = {
  portal: Portal;
  user: SessionUser;
  children: React.ReactNode;
};

export async function AppShell({ portal, user, children }: AppShellProps) {
  const [cookieStore, notifications] = await Promise.all([cookies(), getNotificationSummary(user.id)]);
  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "1";

  return (
    <SidebarProvider defaultCollapsed={collapsed}>
      <div className="flex min-h-screen">
        <DesktopSidebar portal={portal} />
        <MobileSidebar portal={portal} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header portal={portal} user={user} notifications={notifications} />
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
