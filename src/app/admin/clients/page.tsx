import Link from "next/link";
import { PiMagnifyingGlass, PiPlus, PiUsers } from "react-icons/pi";
import { ClientSearch } from "@/components/admin/clients/client-search";
import { ClientsTable } from "@/components/admin/clients/clients-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { listClients } from "@/lib/clients";
import { navLabels } from "@/lib/labels";
import { requireAdmin } from "@/lib/rbac";

export default async function ClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const clients = await listClients(query);

  const addButton = (
    <Button asChild>
      <Link href="/admin/clients/new">
        <PiPlus className="size-5" />
        Tambah Klien
      </Link>
    </Button>
  );

  return (
    <>
      <PageHeader
        title={navLabels.clients}
        description="Data klien beserta akun login mereka untuk masuk ke portal klien."
        breadcrumbs={[{ label: navLabels.dashboard, href: "/admin" }, { label: navLabels.clients }]}
        actions={addButton}
      />

      {!query && clients.length === 0 ? (
        <EmptyState
          icon={PiUsers}
          title="Belum ada klien"
          description="Klik 'Tambah Klien' untuk mendaftarkan klien pertama beserta akun loginnya."
          action={addButton}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ClientSearch query={query} />
            <p className="text-muted-foreground">
              {query ? `${clients.length} hasil untuk "${query}"` : `${clients.length} klien`}
              {query && (
                <Link href="/admin/clients" className="ml-3 font-medium text-primary hover:underline">
                  Tampilkan semua
                </Link>
              )}
            </p>
          </div>

          {clients.length > 0 ? (
            <ClientsTable clients={clients} />
          ) : (
            <EmptyState
              icon={PiMagnifyingGlass}
              title={`Tidak ada klien yang cocok dengan "${query}"`}
              description="Periksa ejaan, atau coba cari dengan nama PIC maupun nama perusahaan."
              action={
                <Button asChild variant="outline">
                  <Link href="/admin/clients">Tampilkan semua klien</Link>
                </Button>
              }
            />
          )}
        </div>
      )}
    </>
  );
}
