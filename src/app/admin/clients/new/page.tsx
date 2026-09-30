import { NewClientForm } from "@/components/admin/clients/new-client-form";
import { PageHeader } from "@/components/shared/page-header";
import { navLabels } from "@/lib/labels";
import { requireAdmin } from "@/lib/rbac";

export default async function NewClientPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="Tambah Klien"
        description="Daftarkan klien baru sekaligus akun login untuk portal klien."
        breadcrumbs={[
          { label: navLabels.dashboard, href: "/admin" },
          { label: navLabels.clients, href: "/admin/clients" },
          { label: "Tambah Klien" },
        ]}
      />
      <NewClientForm />
    </>
  );
}
