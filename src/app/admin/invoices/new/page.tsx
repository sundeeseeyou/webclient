import Link from "next/link";
import { PiKanban } from "react-icons/pi";
import { InvoiceForm } from "@/components/admin/invoices/invoice-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toDateInputValue } from "@/lib/dates";
import { INVOICE_DUE_DAYS } from "@/lib/invoice";
import { navLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function NewInvoicePage({ searchParams }: PageProps<"/admin/invoices/new">) {
  await requireAdmin();
  const { projectId } = await searchParams;

  // Invoice hanya untuk proyek milik klien aktif (sama dengan aturan di POST /api/invoices).
  const projects = await prisma.project.findMany({
    where: { client: { isActive: true } },
    orderBy: [{ client: { company: "asc" } }, { startDate: "desc" }],
    select: { id: true, name: true, client: { select: { company: true } } },
  });
  const options = projects.map((project) => ({ id: project.id, name: project.name, company: project.client.company }));
  // "Generate dari proyek": dibuka dari tab Invoice proyek, jadi klien dan proyek langsung terisi.
  const selected = options.find((option) => option.id === projectId);
  const now = new Date();

  return (
    <>
      <PageHeader
        title="Buat Invoice"
        description="Invoice disimpan sebagai draf dan belum terlihat oleh klien sampai dikirim."
        breadcrumbs={
          selected
            ? [
                { label: navLabels.projects, href: "/admin/projects" },
                { label: selected.name, href: `/admin/projects/${selected.id}?tab=invoice` },
                { label: "Buat Invoice" },
              ]
            : [{ label: navLabels.invoices, href: "/admin/invoices" }, { label: "Buat Invoice" }]
        }
      />
      {options.length === 0 ? (
        <EmptyState
          icon={PiKanban}
          title="Belum ada proyek yang bisa ditagih"
          description="Invoice dibuat untuk proyek milik klien aktif. Tambahkan proyek terlebih dahulu."
          action={
            <Button asChild>
              <Link href="/admin/projects/new">Tambah Proyek</Link>
            </Button>
          }
        />
      ) : (
        <Card className="max-w-4xl">
          <CardContent>
            <InvoiceForm
              projects={options}
              lockedProject={selected}
              cancelHref={selected ? `/admin/projects/${selected.id}?tab=invoice` : "/admin/invoices"}
              defaultValues={{
                projectId: selected?.id ?? "",
                issuedDate: toDateInputValue(now),
                dueDate: toDateInputValue(new Date(now.getTime() + INVOICE_DUE_DAYS * DAY_MS)),
                notes: "",
                items: [{ description: "", qty: 1, unitPrice: "" }],
              }}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
