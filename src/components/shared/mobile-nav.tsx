"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import type { Portal } from "@/components/shared/nav-items";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { uiText } from "@/lib/labels";

export function MobileNav({ portal }: { portal: Portal }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">{uiText.openMenu}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 gap-0 p-0" aria-describedby={undefined}>
        <SheetHeader className="h-14 justify-center border-b px-5 py-0">
          <SheetTitle>
            <Wordmark />
          </SheetTitle>
        </SheetHeader>
        <SidebarNav portal={portal} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
