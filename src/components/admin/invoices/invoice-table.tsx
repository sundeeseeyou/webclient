import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableLinkRow } from "@/components/shared/table-link-row";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatRupiah } from "@/lib/format";
import type { InvoiceListItem } from "@/lib/invoice-queries";
import { invoiceStatusLabels } from "@/lib/labels";
import { invoiceStatusTone } from "@/lib/status-tones";

type InvoiceTableProps = {
  invoices: InvoiceListItem[];
  // Kolom klien/proyek disembunyikan bila tabel sudah berada di halaman klien/proyek tersebut.
  showClient?: boolean;
  showProject?: boolean;
};

export function InvoiceTable({ invoices, showClient = true, showProject = true }: InvoiceTableProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Nomor</TableHead>
            {showClient && <TableHead>Klien</TableHead>}
            {showProject && <TableHead>Proyek</TableHead>}
            <TableHead>Terbit</TableHead>
            <TableHead>Jatuh tempo</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const href = `/admin/invoices/${invoice.id}`;
            return (
              <TableLinkRow key={invoice.id} href={href}>
                <TableCell>
                  <Link href={href} className="font-medium transition-colors hover:text-primary">
                    {invoice.number}
                  </Link>
                </TableCell>
                {showClient && <TableCell>{invoice.project.client.company}</TableCell>}
                {showProject && <TableCell className="min-w-48 whitespace-normal">{invoice.project.name}</TableCell>}
                <TableCell>{formatDate(invoice.issuedDate)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatRupiah(invoice.amount)}</TableCell>
                <TableCell>
                  <StatusBadge tone={invoiceStatusTone[invoice.status]}>{invoiceStatusLabels[invoice.status]}</StatusBadge>
                </TableCell>
              </TableLinkRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
