"use client";

import { useRouter } from "next/navigation";
import { PiTrash } from "react-icons/pi";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { uiText } from "@/lib/labels";

type WebsiteDeleteButtonProps = {
  websiteId: string;
  domain: string;
  clientId: string;
};

export function WebsiteDeleteButton({ websiteId, domain, clientId }: WebsiteDeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const result = await apiRequest(`/api/websites/${websiteId}`, { method: "DELETE" });
    if (result.error) {
      toast.error(result.error.message);
      return false;
    }
    toast.success(`Website ${domain} berhasil dihapus.`);
    router.push(`/admin/clients/${clientId}`);
  };

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm" className="text-danger hover:text-danger">
          <PiTrash />
          {uiText.delete}
        </Button>
      }
      title={`Hapus website ${domain}?`}
      description="Statistik pengunjung dan daftar artikel website ini ikut terhapus. Proyek dan permintaan klien tetap tersimpan. Tindakan ini tidak bisa dibatalkan."
      onConfirm={handleDelete}
    />
  );
}
