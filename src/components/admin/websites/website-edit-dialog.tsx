"use client";

import { useState } from "react";
import { PiPencilSimple } from "react-icons/pi";
import { WebsiteForm, type ClientOption } from "@/components/admin/websites/website-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { uiText } from "@/lib/labels";
import type { WebsiteInput } from "@/lib/validations/website";

type WebsiteEditDialogProps = {
  websiteId: string;
  clients: ClientOption[];
  defaultValues: WebsiteInput;
};

export function WebsiteEditDialog({ websiteId, clients, defaultValues }: WebsiteEditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PiPencilSimple />
          {uiText.edit}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ubah data website</DialogTitle>
          <DialogDescription>Perbarui informasi domain, hosting, dan integrasi website.</DialogDescription>
        </DialogHeader>
        <WebsiteForm
          websiteId={websiteId}
          clients={clients}
          defaultValues={defaultValues}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
