import Link from "next/link";
import { PiPlus, PiReceipt } from "react-icons/pi";
import { InvoiceTable } from "@/components/admin/invoices/invoice-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { InvoiceListItem } from "@/lib/invoice-queries";

type ProjectInvoicesTabProps = {
  projectId: string;
  invoices: InvoiceListItem[];
};

export function ProjectInvoicesTab({ projectId, invoices }: ProjectInvoicesTabProps) {
  const createButton = (
    <Button asChild>
      <Link href={`/admin/invoices/new?projectId=${projectId}`}>
        <PiPlus />
        Buat Invoice
      </Link>
    </Button>
  );

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={PiReceipt}
        title="Belum ada invoice untuk proyek ini"
        description="Klik 'Buat Invoice' untuk menagih pekerjaan proyek ini. Data klien dan proyek terisi otomatis."
        action={createButton}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">Invoice proyek ini, dari yang terbaru. Klik baris untuk melihat detail.</p>
        {createButton}
      </div>
      <InvoiceTable invoices={invoices} showClient={false} showProject={false} />
    </div>
  );
}
