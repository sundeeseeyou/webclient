import { PiReceipt } from "react-icons/pi";
import { InvoiceList } from "@/components/portal/invoice-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { formatRupiah } from "@/lib/format";
import { invoiceAccessWhere, listInvoices } from "@/lib/invoice-queries";
import { navLabels } from "@/lib/labels";
import { requireClient } from "@/lib/rbac";

export default async function PortalInvoicesPage() {
  const user = await requireClient();
  // Hanya invoice proyek milik klien ini yang sudah dikirim; draf dan invoice batal tidak pernah tampil.
  const invoices = await listInvoices(invoiceAccessWhere(user));

  const unpaid = invoices.filter((invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE");
  const unpaidTotal = unpaid.reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueCount = unpaid.filter((invoice) => invoice.status === "OVERDUE").length;

  return (
    <>
      <PageHeader title={navLabels.invoices} description="Tagihan dari tim Boowat. Unduh PDF untuk arsip atau keperluan pembayaran." />
      {invoices.length === 0 ? (
        <EmptyState
          icon={PiReceipt}
          title="Belum ada invoice"
          description="Invoice dari tim Boowat akan tampil di sini setelah dikirim, dan Anda akan mendapat notifikasi."
        />
      ) : (
        <>
          <div className="mb-4 rounded-xl border bg-card px-5 py-4 shadow-xs">
            <p className="text-muted-foreground">
              Belum dibayar: <span className="text-base font-semibold text-foreground">{formatRupiah(unpaidTotal)}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {unpaid.length === 0 ? "Semua invoice sudah lunas." : `${unpaid.length} invoice menunggu pembayaran`}
              {overdueCount > 0 && <span className="font-medium text-danger"> · {overdueCount} sudah lewat jatuh tempo</span>}
            </p>
          </div>
          <InvoiceList invoices={invoices} />
        </>
      )}
    </>
  );
}
