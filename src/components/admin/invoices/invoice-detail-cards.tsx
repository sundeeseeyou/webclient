import type { InvoiceStatus } from "@prisma/client";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatDateTime, formatRupiah } from "@/lib/format";
import type { InvoiceDetail } from "@/lib/invoice-queries";
import { invoiceStatusLabels } from "@/lib/labels";
import { invoiceStatusTone } from "@/lib/status-tones";

const statusNotes: Record<InvoiceStatus, string> = {
  DRAFT: "Belum terlihat oleh klien. Kirim invoice agar klien bisa melihat dan mengunduhnya.",
  SENT: "Sudah tampil di portal klien dan menunggu pembayaran.",
  OVERDUE: "Sudah lewat jatuh tempo dan belum dibayar.",
  PAID: "Pembayaran sudah diterima.",
  CANCELLED: "Invoice dibatalkan dan tidak terlihat oleh klien.",
};

const linkClass = "font-medium text-primary hover:underline";

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 wrap-break-word">{children}</dd>
    </div>
  );
}

export function InvoiceItemsCard({ invoice }: { invoice: InvoiceDetail }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="border-b pt-5">
        <CardTitle>Rincian tagihan</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Deskripsi</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead className="text-right">Harga satuan</TableHead>
            <TableHead className="pr-5 text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.items.map((item) => (
            <TableRow key={item.id} className="hover:bg-transparent">
              <TableCell className="min-w-48 pl-5 whitespace-normal">{item.description}</TableCell>
              <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
              <TableCell className="text-right tabular-nums">{formatRupiah(item.unitPrice)}</TableCell>
              <TableCell className="pr-5 text-right tabular-nums">{formatRupiah(item.unitPrice * item.qty)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between gap-4 border-t bg-muted/40 px-5 py-4">
        <span className="font-medium">Total</span>
        <span className="text-base font-semibold tabular-nums">{formatRupiah(invoice.amount)}</span>
      </div>
      {invoice.notes && (
        <div className="border-t px-5 py-4">
          <p className="text-xs text-muted-foreground">Catatan</p>
          <p className="mt-1 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}
    </Card>
  );
}

export function InvoiceStatusCard({ invoice, draftPastDue }: { invoice: InvoiceDetail; draftPastDue: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
        <CardAction>
          <StatusBadge tone={invoiceStatusTone[invoice.status]}>{invoiceStatusLabels[invoice.status]}</StatusBadge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{statusNotes[invoice.status]}</p>
        {draftPastDue && (
          <p role="status" className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5 text-warning">
            Tanggal jatuh tempo sudah lewat. Ubah jatuh tempo sebelum mengirim invoice ini.
          </p>
        )}
        <dl className="grid grid-cols-2 gap-4 border-t pt-4">
          <InfoItem label="Tanggal terbit">{formatDate(invoice.issuedDate)}</InfoItem>
          <InfoItem label="Jatuh tempo">
            <span className={invoice.status === "OVERDUE" ? "text-danger" : undefined}>{formatDate(invoice.dueDate)}</span>
          </InfoItem>
          {invoice.paidAt && <InfoItem label="Dibayar">{formatDate(invoice.paidAt)}</InfoItem>}
          <InfoItem label="Dibuat">{formatDateTime(invoice.createdAt)}</InfoItem>
        </dl>
      </CardContent>
    </Card>
  );
}

export function InvoiceBillingCard({ invoice }: { invoice: InvoiceDetail }) {
  const { client, website } = invoice.project;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Klien &amp; proyek</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4">
          <InfoItem label="Klien">
            <Link href={`/admin/clients/${client.id}`} className={linkClass}>
              {client.company}
            </Link>
          </InfoItem>
          <InfoItem label="PIC">
            {client.name}
            <span className="block text-muted-foreground">{client.email}</span>
          </InfoItem>
          <InfoItem label="Proyek">
            <Link href={`/admin/projects/${invoice.project.id}?tab=invoice`} className={linkClass}>
              {invoice.project.name}
            </Link>
          </InfoItem>
          <InfoItem label="Website">
            {website ? (
              <Link href={`/admin/websites/${website.id}`} className={linkClass}>
                {website.domain}
              </Link>
            ) : (
              "Tanpa website"
            )}
          </InfoItem>
        </dl>
      </CardContent>
    </Card>
  );
}
