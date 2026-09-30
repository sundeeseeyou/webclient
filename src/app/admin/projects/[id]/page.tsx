import { notFound } from "next/navigation";
import { ProjectInvoicesTab } from "@/components/admin/invoices/project-invoices-tab";
import { ProjectOverview } from "@/components/admin/project-overview";
import { type ProjectTab, ProjectTabs } from "@/components/admin/project-tabs";
import { SprintList } from "@/components/admin/sprint-list";
import { MessageThread } from "@/components/shared/message-thread";
import { PageHeader } from "@/components/shared/page-header";
import { listInvoices } from "@/lib/invoice-queries";
import { navLabels, projectTypeLabels } from "@/lib/labels";
import { getProjectMessages } from "@/lib/messages";
import { prisma } from "@/lib/prisma";
import { projectProgress } from "@/lib/progress";
import { requireAdmin } from "@/lib/rbac";

function parseTab(value: unknown): ProjectTab {
  return value === "sprint" || value === "pesan" || value === "invoice" ? value : "ringkasan";
}

export default async function AdminProjectDetailPage({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const user = await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: {
        select: { id: true, company: true, websites: { orderBy: { domain: "asc" }, select: { id: true, domain: true } } },
      },
      website: { select: { id: true, domain: true } },
      sprints: {
        orderBy: { startDate: "asc" },
        include: { tasks: { orderBy: [{ order: "asc" }, { updatedAt: "asc" }] } },
      },
    },
  });
  if (!project) notFound();

  const messages = await getProjectMessages(id);
  const invoices = await listInvoices({ projectId: id });
  const progress = projectProgress(project);
  const allTasks = project.sprints.flatMap((sprint) => sprint.tasks);
  const taskCount = allTasks.length;
  const doneCount = allTasks.filter((task) => task.status === "DONE").length;

  return (
    <>
      <PageHeader
        title={project.name}
        description={`${project.client.company} · ${projectTypeLabels[project.type]}`}
        breadcrumbs={[{ label: navLabels.projects, href: "/admin/projects" }, { label: project.name }]}
      />
      <ProjectTabs
        initialTab={parseTab(query.tab)}
        panels={{
          ringkasan: <ProjectOverview project={project} progress={progress} taskCount={taskCount} doneCount={doneCount} />,
          sprint: (
            <SprintList
              projectId={project.id}
              sprints={project.sprints}
              progress={progress}
              taskCount={taskCount}
              doneCount={doneCount}
            />
          ),
          pesan: (
            <MessageThread
              projectId={project.id}
              currentUserId={user.id}
              initialMessages={messages}
              description={`Diskusi dengan ${project.client.company}. Klien mendapat notifikasi setiap ada pesan baru.`}
            />
          ),
          invoice: <ProjectInvoicesTab projectId={project.id} invoices={invoices} />,
        }}
      />
    </>
  );
}
