"use client";

import type { InvoiceStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { PiCheckCircle, PiPaperPlaneTilt, PiXCircle } from "react-icons/pi";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

type InvoiceStatusActionsProps = {
  invoiceId: string;
  number: string;
  company: string;
  status: InvoiceStatus;
  // Dihitung di server dengan canApplyInvoiceAction; API tetap memeriksa ulang.
  allowed: { send: boolean; markPaid: boolean; cancel: boolean };
};

export function InvoiceStatusActions({ invoiceId, number, company, status, allowed }: InvoiceStatusActionsProps) {
  const router = useRouter();

  const run = (action: "send" | "mark-paid" | "cancel", successMessage: string) => async () => {
    const result = await apiRequest(`/api/invoices/${invoiceId}/${action}`, { method: "POST" });
    if (result.error) {
      toast.error(result.error.message);
      return false;
    }
    toast.success(successMessage);
    router.refresh();
  };

  return (
    <>
      {allowed.cancel && (
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="text-danger hover:text-danger">
              <PiXCircle />
              Batalkan
            </Button>
          }
          title="Batalkan invoice ini?"
          description={
            status === "DRAFT"
              ? `Invoice ${number} tidak akan bisa dikirim lagi. Nomornya tetap tercatat dan tidak dipakai ulang.`
              : `Invoice ${number} akan hilang dari portal ${company} dan tidak bisa ditandai lunas lagi. Nomornya tetap tercatat dan tidak dipakai ulang.`
          }
          confirmLabel="Batalkan Invoice"
          onConfirm={run("cancel", `Invoice ${number} dibatalkan.`)}
        />
      )}
      {allowed.markPaid && (
        <ConfirmDialog
          trigger={
            <Button>
              <PiCheckCircle />
              Tandai Lunas
            </Button>
          }
          title="Tandai invoice sudah lunas?"
          description={`Invoice ${number} dicatat lunas per hari ini dan ${company} melihat status Lunas. Pastikan pembayaran sudah diterima, karena status ini tidak bisa dikembalikan.`}
          confirmLabel="Tandai Lunas"
          destructive={false}
          onConfirm={run("mark-paid", `Invoice ${number} ditandai lunas.`)}
        />
      )}
      {allowed.send && (
        <ConfirmDialog
          trigger={
            <Button>
              <PiPaperPlaneTilt />
              Kirim ke Klien
            </Button>
          }
          title="Kirim invoice ke klien?"
          description={`Invoice ${number} akan tampil di portal ${company} dan semua akun klien mendapat notifikasi. Setelah dikirim, isi invoice tidak bisa diubah lagi.`}
          confirmLabel="Kirim ke Klien"
          destructive={false}
          onConfirm={run("send", `Invoice ${number} berhasil dikirim ke klien.`)}
        />
      )}
    </>
  );
}
