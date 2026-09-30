import Link from "next/link";
import { PiReceipt } from "react-icons/pi";
import { InvoiceTable } from "@/components/admin/invoices/invoice-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { InvoiceListItem } from "@/lib/invoice-queries";

type ClientInvoicesTabProps = {
  clientId: string;
  invoices: InvoiceListItem[];
};

export function ClientInvoicesTab({ clientId, invoices }: ClientInvoicesTabProps) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={PiReceipt}
        title="Belum ada invoice untuk klien ini"
        description="Invoice dibuat dari tab Invoice di halaman proyek klien ini."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">Invoice dari semua proyek klien ini, dari yang terbaru.</p>
        <Button variant="outline" asChild>
          <Link href={`/admin/invoices?clientId=${clientId}&status=unpaid`}>Lihat yang belum lunas</Link>
        </Button>
      </div>
      <InvoiceTable invoices={invoices} showClient={false} />
    </div>
  );
}
