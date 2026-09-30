import Link from "next/link";
import { PiPlus, PiReceipt } from "react-icons/pi";
import { InvoiceFilters } from "@/components/admin/invoices/invoice-filters";
import { InvoiceTable } from "@/components/admin/invoices/invoice-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { listInvoices, parseInvoiceFilter } from "@/lib/invoice-queries";
import { navLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

export default async function AdminInvoicesPage({ searchParams }: PageProps<"/admin/invoices">) {
  await requireAdmin();
  const query = await searchParams;
  const status = parseInvoiceFilter(query.status);
  const clientId = typeof query.clientId === "string" && query.clientId ? query.clientId : undefined;

  const [invoices, clients] = await Promise.all([
    listInvoices(clientId ? { project: { clientId } } : {}, status),
    prisma.client.findMany({ orderBy: { company: "asc" }, select: { id: true, company: true } }),
  ]);
  const isFiltered = Boolean(status || clientId);
  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <>
      <PageHeader
        title={navLabels.invoices}
        description="Semua invoice klien beserta status pembayarannya."
        actions={
          <Button asChild>
            <Link href="/admin/invoices/new">
              <PiPlus />
              Buat Invoice
            </Link>
          </Button>
        }
      />
      <InvoiceFilters clients={clients} status={status} clientId={clientId} />
      {invoices.length > 0 ? (
        <>
          {/* Jumlah nominal hanya berarti bila statusnya seragam (misalnya total yang belum lunas). */}
          <p className="mb-3 text-muted-foreground">
            {invoices.length} invoice{status && `, total ${formatRupiah(total)}`}
          </p>
          <InvoiceTable invoices={invoices} />
        </>
      ) : (
        <EmptyState
          icon={PiReceipt}
          title={isFiltered ? "Tidak ada invoice yang sesuai filter" : "Belum ada invoice"}
          description={
            isFiltered
              ? "Coba ubah atau hapus filter status dan klien."
              : "Klik 'Buat Invoice', atau buka tab Invoice di halaman proyek agar data klien terisi otomatis."
          }
        />
      )}
    </>
  );
}
