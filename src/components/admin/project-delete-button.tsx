"use client";

import { useRouter } from "next/navigation";
import { PiTrash } from "react-icons/pi";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

export function ProjectDeleteButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const router = useRouter();

  const remove = async () => {
    const result = await apiRequest(`/api/projects/${projectId}`, { method: "DELETE" });
    if (result.error) {
      toast.error(result.error.message);
      return false;
    }
    toast.success("Proyek berhasil dihapus.");
    router.push("/admin/projects");
  };

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm" className="text-danger hover:text-danger">
          <PiTrash />
          Hapus proyek
        </Button>
      }
      title="Hapus proyek ini?"
      description={`"${projectName}" beserta semua sprint, task, dan pesannya akan dihapus permanen.`}
      confirmLabel="Hapus proyek"
      onConfirm={remove}
    />
  );
}
