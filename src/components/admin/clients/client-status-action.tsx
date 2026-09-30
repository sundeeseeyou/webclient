"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

type ClientStatusActionProps = {
  clientId: string;
  company: string;
  isActive: boolean;
};

export function ClientStatusAction({ clientId, company, isActive }: ClientStatusActionProps) {
  const router = useRouter();

  const onConfirm = async () => {
    const url = `/api/clients/${clientId}`;
    const result = isActive
      ? await apiRequest(url, { method: "DELETE" })
      : await apiRequest(url, { method: "PATCH", body: { isActive: true } });
    if (result.error) {
      toast.error(result.error.message);
      return false;
    }
    toast.success(isActive ? "Klien dinonaktifkan. Akun kliennya tidak bisa login lagi." : "Klien aktif kembali. Akun kliennya bisa login lagi.");
    router.refresh();
  };

  if (isActive) {
    return (
      <ConfirmDialog
        trigger={
          <Button variant="outline" className="text-danger hover:bg-danger/5 hover:text-danger">
            Nonaktifkan
          </Button>
        }
        title={`Nonaktifkan ${company}?`}
        description="Semua akun login klien ini tidak bisa masuk ke portal sampai klien diaktifkan kembali. Data website, proyek, dan riwayat lainnya tetap tersimpan."
        confirmLabel="Nonaktifkan"
        onConfirm={onConfirm}
      />
    );
  }

  return (
    <ConfirmDialog
      trigger={<Button variant="outline">Aktifkan kembali</Button>}
      title={`Aktifkan kembali ${company}?`}
      description="Akun login klien ini bisa dipakai lagi untuk masuk ke portal klien."
      confirmLabel="Aktifkan kembali"
      destructive={false}
      onConfirm={onConfirm}
    />
  );
}
