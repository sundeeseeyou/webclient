"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { value: "ringkasan", label: "Ringkasan" },
  { value: "sprint", label: "Sprint & Task" },
  { value: "pesan", label: "Pesan" },
] as const;

export type ProjectTab = (typeof tabs)[number]["value"];

type ProjectTabsProps = {
  initialTab: ProjectTab;
  panels: Record<ProjectTab, React.ReactNode>;
};

export function ProjectTabs({ initialTab, panels }: ProjectTabsProps) {
  const [active, setActive] = useState<ProjectTab>(initialTab);
  const [syncedTab, setSyncedTab] = useState<ProjectTab>(initialTab);

  // Navigasi ke URL dengan ?tab= lain di halaman yang sama (misalnya dari lonceng notifikasi) ikut mengganti tab.
  if (initialTab !== syncedTab) {
    setSyncedTab(initialTab);
    setActive(initialTab);
  }

  const change = (value: string) => {
    const next = tabs.find((tab) => tab.value === value)?.value;
    if (!next) return;
    setActive(next);
    // Tab disimpan di URL (?tab=) agar bisa dibagikan dan dibuka langsung dari notifikasi, tanpa memuat ulang halaman.
    window.history.replaceState(null, "", `?tab=${next}`);
  };

  return (
    <Tabs value={active} onValueChange={change} className="gap-6">
      <TabsList className="w-full sm:w-fit">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="px-4">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {panels[tab.value]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
