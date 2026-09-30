"use client";

import { useRouter } from "next/navigation";
import { PiCheckCircle } from "react-icons/pi";
import { toast } from "sonner";
import { RevisionDialog } from "@/components/portal/revision-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

// Tampil di detail proyek portal saat status proyek Menunggu Persetujuan (PRD 6.2).
export function ProjectApproval({ projectId }: { projectId: string }) {
  const router = useRouter();

  const approve = async () => {
    const result = await apiRequest(`/api/projects/${projectId}/approve`, { method: "POST" });
    if (result.error) {
      toast.error(result.error.message);
      return false;
    }
    toast.success("Terima kasih, hasil proyek sudah Anda setujui.");
    router.refresh();
  };

  return (
    <section aria-label="Persetujuan hasil proyek" className="mb-6 rounded-xl border border-warning/40 bg-warning/5 p-4 sm:p-5">
      <p className="font-medium text-warning">Hasil pekerjaan menunggu persetujuan Anda</p>
      <p className="mt-1 text-muted-foreground">
        Silakan periksa hasilnya. Bila sudah sesuai, klik &quot;Setujui Hasil&quot; dan proyek dinyatakan selesai. Bila
        masih ada yang perlu diperbaiki, klik &quot;Minta Revisi&quot; lalu jelaskan perubahan yang Anda inginkan.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <ConfirmDialog
          trigger={
            <Button type="button">
              <PiCheckCircle />
              Setujui Hasil
            </Button>
          }
          title="Setujui hasil proyek?"
          description="Proyek akan dinyatakan selesai dan tanggal persetujuan dicatat. Bila nanti ada perubahan, Anda tetap bisa mengajukan permintaan baru."
          confirmLabel="Ya, setujui"
          destructive={false}
          onConfirm={approve}
        />
        <RevisionDialog projectId={projectId} />
      </div>
    </section>
  );
}
