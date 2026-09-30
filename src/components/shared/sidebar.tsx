"use client";

import Link from "next/link";
import { cn } from "cn";
import { PiSidebarSimple } from "react-icons/pi";
import type { Portal } from "@/components/shared/nav-items";
import { useSidebar } from "@/components/shared/sidebar-context";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { uiText } from "@/lib/labels";

function MenuLabel({ hidden }: { hidden?: boolean }) {
  return (
    <p className={cn("mb-3 px-3 text-xs font-medium tracking-wider text-muted-foreground uppercase", hidden && "sr-only")}>
      {uiText.menu}
    </p>
  );
}

export function DesktopSidebar({ portal }: { portal: Portal }) {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-card transition-[width] duration-200 lg:flex",
        collapsed ? "w-20" : "w-[264px]",
      )}
    >
      <div className={cn("flex h-16 shrink-0 items-center border-b", collapsed ? "justify-center" : "px-6")}>
        <Link href={`/${portal}`} aria-label={uiText.appName}>
          <Wordmark compact={collapsed} />
        </Link>
      </div>
      <div className={cn("flex-1 overflow-y-auto py-6", collapsed ? "px-3" : "px-4")}>
        <MenuLabel hidden={collapsed} />
        <SidebarNav portal={portal} collapsed={collapsed} />
      </div>
      {!collapsed && (
        <p className="border-t px-6 py-4 text-xs text-muted-foreground">
          {portal === "admin" ? uiText.adminPortal : uiText.clientPortal}
        </p>
      )}
    </aside>
  );
}

export function MobileSidebar({ portal }: { portal: Portal }) {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-[280px] gap-0 p-0" aria-describedby={undefined}>
        <SheetHeader className="h-16 justify-center border-b px-6 py-0">
          <SheetTitle>
            <Wordmark />
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 py-6">
          <MenuLabel />
          <SidebarNav portal={portal} onNavigate={() => setMobileOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SidebarToggle() {
  const { toggle } = useSidebar();

  return (
    <Button variant="outline" size="icon" onClick={toggle} className="text-muted-foreground">
      <PiSidebarSimple className="size-5" />
      <span className="sr-only">{uiText.toggleSidebar}</span>
    </Button>
  );
}
