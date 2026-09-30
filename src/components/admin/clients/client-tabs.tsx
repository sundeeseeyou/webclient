"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ClientTab = {
  value: string;
  label: string;
  content: React.ReactNode;
};

type ClientTabsProps = {
  tabs: ClientTab[];
  initialTab: string;
};

export function ClientTabs({ tabs, initialTab }: ClientTabsProps) {
  const [active, setActive] = useState(initialTab);

  // Tab disimpan di URL (?tab=) lewat history API agar bisa dibagikan/di-refresh tanpa memuat ulang data dari server.
  const onValueChange = (value: string) => {
    setActive(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.replaceState(null, "", url);
  };

  return (
    <Tabs value={active} onValueChange={onValueChange} className="gap-4">
      {/* Di layar sempit deretan tab digeser ke samping agar halaman tidak ikut melebar. */}
      <div className="overflow-x-auto border-b">
        <TabsList variant="line" className="h-auto min-w-max gap-4 p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-none rounded-none px-1 pt-1 pb-3 after:bg-primary group-data-[orientation=horizontal]/tabs:after:bottom-0 data-[state=active]:text-primary"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
