"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { navItems, type Portal } from "@/components/shared/nav-items";

type SidebarNavProps = {
  portal: Portal;
  onNavigate?: () => void;
};

export function SidebarNav({ portal, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems[portal].map(({ href, label, icon: Icon }) => {
        // Beranda (/admin, /portal) hanya aktif di halamannya sendiri, menu lain aktif juga di sub-halamannya.
        const isRoot = href === `/${portal}`;
        const isActive = isRoot ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2 text-sm transition-colors",
              isActive
                ? "border-secondary bg-primary/5 font-medium text-primary"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
