"use client";

import { useState } from "react";
import { PiPencilSimple } from "react-icons/pi";
import { InvoiceForm } from "@/components/admin/invoices/invoice-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { InvoiceInput } from "@/lib/validations/invoice";

type InvoiceEditDialogProps = {
  invoice: { id: string; number: string };
  lockedProject: { company: string; name: string };
  defaultValues: InvoiceInput;
};

export function InvoiceEditDialog({ invoice, lockedProject, defaultValues }: InvoiceEditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PiPencilSimple />
          Ubah
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ubah invoice</DialogTitle>
          <DialogDescription>
            Hanya draf yang bisa diubah. Proyek tidak bisa diganti, dan nomor ikut berganti bila bulan terbit dipindah.
          </DialogDescription>
        </DialogHeader>
        <InvoiceForm
          invoice={invoice}
          lockedProject={lockedProject}
          defaultValues={defaultValues}
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
