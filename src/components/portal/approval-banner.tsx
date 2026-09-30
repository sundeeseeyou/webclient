import Link from "next/link";
import { Button } from "@/components/ui/button";

type ApprovalBannerProps = {
  projects: { id: string; name: string }[];
};

export function ApprovalBanner({ projects }: ApprovalBannerProps) {
  if (projects.length === 0) return null;

  return (
    <section
      aria-label="Proyek menunggu persetujuan"
      className="mb-6 rounded-xl border border-warning/40 bg-warning/5 p-4 sm:p-5"
    >
      <p className="font-medium text-warning">
        {projects.length === 1
          ? "Ada 1 proyek yang menunggu persetujuan Anda"
          : `Ada ${projects.length} proyek yang menunggu persetujuan Anda`}
      </p>
      <p className="mt-1 text-muted-foreground">Periksa hasil pekerjaan, lalu setujui atau minta revisi.</p>
      <ul className="mt-3 space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
            <span className="min-w-0 font-medium wrap-break-word">{project.name}</span>
            <Button asChild size="sm">
              <Link href={`/portal/projects/${project.id}`}>Tinjau hasil</Link>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
