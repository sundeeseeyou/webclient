import Link from "next/link";
import { PiUsersThree } from "react-icons/pi";
import { WebsiteForm } from "@/components/admin/websites/website-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { navLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

export default async function NewWebsitePage({ searchParams }: PageProps<"/admin/websites/new">) {
  await requireAdmin();
  const { clientId } = await searchParams;
  const clients = await prisma.client.findMany({
    where: { isActive: true },
    select: { id: true, company: true },
    orderBy: { company: "asc" },
  });
  const selected = clients.find((client) => client.id === clientId);

  return (
    <>
      <PageHeader
        title="Tambah website"
        description="Catat domain, hosting, dan integrasi website milik klien."
        breadcrumbs={[
          { label: navLabels.clients, href: "/admin/clients" },
          ...(selected ? [{ label: selected.company, href: `/admin/clients/${selected.id}` }] : []),
          { label: "Tambah website" },
        ]}
      />
      {clients.length === 0 ? (
        <EmptyState
          icon={PiUsersThree}
          title="Belum ada klien aktif"
          description="Website selalu dimiliki oleh klien. Tambahkan klien terlebih dahulu."
          action={
            <Button asChild>
              <Link href="/admin/clients/new">Tambah klien</Link>
            </Button>
          }
        />
      ) : (
        <Card className="max-w-3xl">
          <CardContent>
            <WebsiteForm
              clients={clients}
              cancelHref={selected ? `/admin/clients/${selected.id}` : "/admin/clients"}
              defaultValues={{
                clientId: selected?.id ?? "",
                domain: "",
                hostingProvider: "",
                hostingRenewAt: "",
                domainRenewAt: "",
                status: "ACTIVE",
                ga4PropertyId: "",
                wpApiUrl: "",
              }}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
