import { cn } from "cn";
import { PiDownloadSimple } from "react-icons/pi";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatRupiah } from "@/lib/format";
import type { InvoiceListItem } from "@/lib/invoice-queries";
import { invoiceStatusLabels } from "@/lib/labels";
import { invoiceStatusTone } from "@/lib/status-tones";

export function InvoiceList({ invoices }: { invoices: InvoiceListItem[] }) {
  return (
    <Card className="gap-0 divide-y overflow-hidden py-0">
      {invoices.map((invoice) => {
        const isOverdue = invoice.status === "OVERDUE";
        return (
          <div
            key={invoice.id}
            className={cn(
              "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
              isOverdue && "bg-danger/5",
            )}
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{invoice.number}</p>
                <StatusBadge tone={invoiceStatusTone[invoice.status]}>{invoiceStatusLabels[invoice.status]}</StatusBadge>
              </div>
              <p className="wrap-break-word">{invoice.project.name}</p>
              <p className="text-xs text-muted-foreground">
                Terbit {formatDate(invoice.issuedDate)} ·{" "}
                <span className={cn(isOverdue && "font-medium text-danger")}>Jatuh tempo {formatDate(invoice.dueDate)}</span>
                {invoice.paidAt && ` · Dibayar ${formatDate(invoice.paidAt)}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
              <p className="text-base font-semibold tabular-nums">{formatRupiah(invoice.amount)}</p>
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/invoices/${invoice.id}/pdf`} download aria-label={`Unduh PDF invoice ${invoice.number}`}>
                  <PiDownloadSimple />
                  Unduh PDF
                </a>
              </Button>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
