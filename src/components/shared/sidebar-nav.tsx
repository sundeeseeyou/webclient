"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { navItems, type Portal } from "@/components/shared/nav-items";

type SidebarNavProps = {
  portal: Portal;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarNav({ portal, collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems[portal].map(({ href, label, icon: Icon }) => {
        // Beranda (/admin, /portal) hanya aktif di halamannya sendiri, menu lain aktif juga di sub-halamannya.
        const isRoot = href === `/${portal}`;
        const isActive = isRoot ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors",
              collapsed && "justify-center px-0",
              isActive ? "bg-primary/[0.07] text-primary" : "text-foreground/75 hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className={cn("size-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            <span className={cn(collapsed && "sr-only")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
