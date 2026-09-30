import { notFound } from "next/navigation";
import { PiDownloadSimple } from "react-icons/pi";
import { InvoiceBillingCard, InvoiceItemsCard, InvoiceStatusCard } from "@/components/admin/invoices/invoice-detail-cards";
import { InvoiceEditDialog } from "@/components/admin/invoices/invoice-edit-dialog";
import { InvoiceStatusActions } from "@/components/admin/invoices/invoice-status-actions";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { toDateInputValue } from "@/lib/dates";
import { canApplyInvoiceAction, isPastDue } from "@/lib/invoice";
import { getInvoiceDetail } from "@/lib/invoice-queries";
import { navLabels } from "@/lib/labels";
import { requireAdmin } from "@/lib/rbac";

export default async function AdminInvoiceDetailPage({ params }: PageProps<"/admin/invoices/[id]">) {
  const user = await requireAdmin();
  const { id } = await params;

  const invoice = await getInvoiceDetail(id, user);
  if (!invoice) notFound();

  const { project } = invoice;
  const isDraft = invoice.status === "DRAFT";

  return (
    <>
      <PageHeader
        title={invoice.number}
        description={`${project.client.company} · ${project.name}`}
        breadcrumbs={[{ label: navLabels.invoices, href: "/admin/invoices" }, { label: invoice.number }]}
        actions={
          <>
            <Button variant="outline" asChild>
              <a href={`/api/invoices/${invoice.id}/pdf`} download>
                <PiDownloadSimple />
                Unduh PDF
              </a>
            </Button>
            {isDraft && (
              <InvoiceEditDialog
                invoice={{ id: invoice.id, number: invoice.number }}
                lockedProject={{ company: project.client.company, name: project.name }}
                defaultValues={{
                  projectId: project.id,
                  issuedDate: toDateInputValue(invoice.issuedDate),
                  dueDate: toDateInputValue(invoice.dueDate),
                  notes: invoice.notes ?? "",
                  items: invoice.items.map(({ description, qty, unitPrice }) => ({ description, qty, unitPrice })),
                }}
              />
            )}
            <InvoiceStatusActions
              invoiceId={invoice.id}
              number={invoice.number}
              company={project.client.company}
              status={invoice.status}
              allowed={{
                send: canApplyInvoiceAction(invoice.status, "send"),
                markPaid: canApplyInvoiceAction(invoice.status, "mark-paid"),
                cancel: canApplyInvoiceAction(invoice.status, "cancel"),
              }}
            />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6">
          <InvoiceStatusCard invoice={invoice} draftPastDue={isDraft && isPastDue(invoice.dueDate)} />
          <InvoiceBillingCard invoice={invoice} />
        </div>
        <div className="min-w-0 lg:order-first lg:col-span-2">
          <InvoiceItemsCard invoice={invoice} />
        </div>
      </div>
    </>
  );
}
