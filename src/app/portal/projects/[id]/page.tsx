import { notFound } from "next/navigation";
import { ProjectApproval } from "@/components/portal/project-approval";
import { progressSentence, projectStatusNotes } from "@/components/portal/project-text";
import { SprintSummary } from "@/components/portal/sprint-summary";
import { MessageThread } from "@/components/shared/message-thread";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { navLabels, projectStatusLabels, projectTypeLabels } from "@/lib/labels";
import { getProjectMessages } from "@/lib/messages";
import { prisma } from "@/lib/prisma";
import { projectProgress } from "@/lib/progress";
import { requireClient } from "@/lib/rbac";
import { projectStatusTone } from "@/lib/status-tones";

export default async function PortalProjectDetailPage({ params }: PageProps<"/portal/projects/[id]">) {
  const user = await requireClient();
  const { id } = await params;

  // Filter clientId dari session: proyek milik klien lain dianggap tidak ada (404), bukan ditolak (403).
  const project = await prisma.project.findFirst({
    where: { id, clientId: user.clientId },
    include: {
      website: { select: { domain: true } },
      sprints: {
        orderBy: { startDate: "asc" },
        select: {
          id: true,
          name: true,
          goal: true,
          startDate: true,
          endDate: true,
          status: true,
          tasks: { select: { status: true } },
        },
      },
    },
  });
  if (!project) notFound();

  const messages = await getProjectMessages(id);
  const progress = projectProgress(project);
  const taskCount = project.sprints.reduce((total, sprint) => total + sprint.tasks.length, 0);

  return (
    <>
      <PageHeader
        title={project.name}
        description={`${project.website?.domain ?? "Tanpa website"} · ${projectTypeLabels[project.type]}`}
        breadcrumbs={[{ label: navLabels.projects, href: "/portal/projects" }, { label: project.name }]}
      />
      {project.status === "WAITING_APPROVAL" && <ProjectApproval projectId={project.id} />}
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Status Proyek</CardTitle>
              <CardAction>
                <StatusBadge tone={projectStatusTone[project.status]}>{projectStatusLabels[project.status]}</StatusBadge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{projectStatusNotes[project.status]}</p>
              <div className="space-y-2">
                <p className="font-medium">{progressSentence(progress, taskCount)}</p>
                <ProgressBar value={progress} label="Progres pekerjaan" />
              </div>
              <dl className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Mulai</dt>
                  <dd className="mt-1">{formatDate(project.startDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Target selesai</dt>
                  <dd className="mt-1">{project.endDate ? formatDate(project.endDate) : "Belum ditentukan"}</dd>
                </div>
                {project.status === "DONE" && project.approvedAt && (
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">Persetujuan</dt>
                    <dd className="mt-1">Disetujui pada {formatDate(project.approvedAt)}</dd>
                  </div>
                )}
              </dl>
              {project.description && <p className="border-t pt-4 whitespace-pre-line text-muted-foreground">{project.description}</p>}
            </CardContent>
          </Card>
          <SprintSummary sprints={project.sprints} />
        </div>
        <MessageThread
          className="min-w-0 xl:col-span-3"
          projectId={project.id}
          currentUserId={user.id}
          initialMessages={messages}
          description="Sampaikan pertanyaan atau masukan untuk tim Boowat. Kami akan mendapat pemberitahuan setiap ada pesan baru."
        />
      </div>
    </>
  );
}
