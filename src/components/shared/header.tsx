import Link from "next/link";
import type { Portal } from "@/components/shared/nav-items";
import { NotificationBell } from "@/components/shared/notification-bell";
import { SidebarToggle } from "@/components/shared/sidebar";
import { UserMenu } from "@/components/shared/user-menu";
import { Wordmark } from "@/components/shared/wordmark";
import { uiText } from "@/lib/labels";
import type { NotificationSummary } from "@/lib/notify";
import type { SessionUser } from "@/lib/rbac";

type HeaderProps = {
  portal: Portal;
  user: SessionUser;
  notifications: NotificationSummary;
};

export function Header({ portal, user, notifications }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-card px-4 lg:px-6">
      <SidebarToggle />
      <Link href={`/${portal}`} aria-label={uiText.appName} className="lg:hidden">
        <Wordmark compact />
      </Link>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <NotificationBell initial={notifications} />
        <UserMenu user={{ name: user.name, email: user.email, role: user.role }} />
      </div>
    </header>
  );
}
