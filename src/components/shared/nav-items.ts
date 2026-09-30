import type { IconType } from "react-icons";
import { PiSquaresFour } from "react-icons/pi";
import { navLabels } from "@/lib/labels";

// Disimpan di modul biasa (bukan "use client") agar nilainya bisa dibaca server component.
export const SIDEBAR_COOKIE = "sidebar-collapsed";

export type Portal = "admin" | "portal";

export type NavItem = {
  href: string;
  label: string;
  icon: IconType;
};

// Menu hanya berisi halaman yang sudah dibuat; item baru ditambahkan bersama halamannya.
export const navItems: Record<Portal, NavItem[]> = {
  admin: [{ href: "/admin", label: navLabels.dashboard, icon: PiSquaresFour }],
  portal: [{ href: "/portal", label: navLabels.dashboard, icon: PiSquaresFour }],
};
