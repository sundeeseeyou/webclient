import { House, type LucideIcon } from "lucide-react";
import { navLabels } from "@/lib/labels";

export type Portal = "admin" | "portal";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Menu hanya berisi halaman yang sudah dibuat; item baru ditambahkan bersama halamannya.
export const navItems: Record<Portal, NavItem[]> = {
  admin: [{ href: "/admin", label: navLabels.dashboard, icon: House }],
  portal: [{ href: "/portal", label: navLabels.dashboard, icon: House }],
};
