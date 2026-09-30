import { Header } from "@/components/shared/header";
import type { Portal } from "@/components/shared/nav-items";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { Wordmark } from "@/components/shared/wordmark";
import { uiText } from "@/lib/labels";
import type { SessionUser } from "@/lib/rbac";

type AppShellProps = {
  portal: Portal;
  user: SessionUser;
  children: React.ReactNode;
};

export function AppShell({ portal, user, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r bg-card md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-5">
          <Wordmark />
          <span className="text-xs text-muted-foreground">
            {portal === "admin" ? uiText.adminPortal : uiText.clientPortal}
          </span>
        </div>
        <SidebarNav portal={portal} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header portal={portal} user={user} />
        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
