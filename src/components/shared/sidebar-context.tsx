"use client";

import { createContext, useContext, useState } from "react";
import { SIDEBAR_COOKIE } from "@/components/shared/nav-items";

type SidebarState = {
  collapsed: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarState | null>(null);

export function SidebarProvider({ defaultCollapsed, children }: { defaultCollapsed: boolean; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Layar lebar menciutkan sidebar (disimpan di cookie agar tidak berkedip saat reload), layar kecil membuka menu geser.
  const toggle = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      const next = !collapsed;
      setCollapsed(next);
      document.cookie = `${SIDEBAR_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
    } else {
      setMobileOpen(true);
    }
  };

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, setMobileOpen, toggle }}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarState {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar harus dipakai di dalam SidebarProvider");
  return context;
}
