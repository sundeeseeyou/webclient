import { logout } from "@/app/(auth)/actions";
import { MobileNav } from "@/components/shared/mobile-nav";
import type { Portal } from "@/components/shared/nav-items";
import { NotificationBell } from "@/components/shared/notification-bell";
import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import { uiText } from "@/lib/labels";
import type { SessionUser } from "@/lib/rbac";

type HeaderProps = {
  portal: Portal;
  user: SessionUser;
};

export function Header({ portal, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-card px-4 md:px-8">
      <MobileNav portal={portal} />
      <div className="md:hidden">
        <Wordmark />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <NotificationBell userId={user.id} />
        <span className="hidden max-w-48 truncate px-2 font-medium sm:inline">{user.name}</span>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm">
            {uiText.logout}
          </Button>
        </form>
      </div>
    </header>
  );
}
