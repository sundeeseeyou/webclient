import { notFound } from "next/navigation";
import { ClientAccountsTab } from "@/components/admin/clients/client-accounts-tab";
import { ClientProfileCard } from "@/components/admin/clients/client-profile-card";
import { ClientProjectsTab } from "@/components/admin/clients/client-projects-tab";
import { ClientRequestsTab } from "@/components/admin/clients/client-requests-tab";
import { ClientTabs } from "@/components/admin/clients/client-tabs";
import { ClientWebsitesTab } from "@/components/admin/clients/client-websites-tab";
import { PageHeader } from "@/components/shared/page-header";
import { getClientDetail } from "@/lib/clients";
import { navLabels } from "@/lib/labels";
import { requireAdmin } from "@/lib/rbac";
import { listRequests } from "@/lib/requests";

export default async function ClientDetailPage({ params, searchParams }: PageProps<"/admin/clients/[id]">) {
  await requireAdmin();
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  const client = await getClientDetail(id);
  if (!client) notFound();
  const requests = await listRequests({ clientId: client.id });

  const tabs = [
    {
      value: "website",
      label: `Website (${client.websites.length})`,
      content: <ClientWebsitesTab clientId={client.id} websites={client.websites} />,
    },
    {
      value: "proyek",
      label: `Proyek (${client.projects.length})`,
      content: <ClientProjectsTab clientId={client.id} projects={client.projects} />,
    },
    {
      value: "permintaan",
      label: `Permintaan (${requests.length})`,
      content: <ClientRequestsTab requests={requests} />,
    },
    {
      value: "akun",
      label: `Akun Login (${client.users.length})`,
      content: <ClientAccountsTab clientId={client.id} isActive={client.isActive} users={client.users} />,
    },
  ];
  const initialTab = tabs.find((item) => item.value === tab)?.value ?? tabs[0].value;

  return (
    <>
      <PageHeader
        title={client.company}
        description={`PIC: ${client.name}`}
        breadcrumbs={[
          { label: navLabels.dashboard, href: "/admin" },
          { label: navLabels.clients, href: "/admin/clients" },
          { label: client.company },
        ]}
      />
      <ClientProfileCard client={client} />
      <ClientTabs tabs={tabs} initialTab={initialTab} />
    </>
  );
}
