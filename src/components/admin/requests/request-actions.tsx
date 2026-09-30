"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { RequestStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RejectDialog } from "@/components/admin/requests/reject-dialog";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { requestStatusLabels, uiText } from "@/lib/labels";
import { allowedTransitions } from "@/lib/sla";
import { responseSchema } from "@/lib/validations/request";

type ForwardStatus = Exclude<RequestStatus, "SUBMITTED" | "REJECTED">;

// Label tombol per status tujuan; tombol yang tampil hanya transisi yang diizinkan alur di lib/sla.ts.
// "Tolak" punya dialog sendiri karena alasan penolakan wajib diisi.
const actionLabels: Record<ForwardStatus, string> = {
  IN_REVIEW: "Mulai tinjau",
  APPROVED: "Setujui",
  IN_PROGRESS: "Mulai kerjakan",
  DONE: "Tandai selesai",
};

const isForward = (status: RequestStatus): status is ForwardStatus => status !== "SUBMITTED" && status !== "REJECTED";

type RequestActionsProps = {
  requestId: string;
  status: RequestStatus;
};

export function RequestActions({ requestId, status }: RequestActionsProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(responseSchema), defaultValues: { adminResponse: "" } });
  const nextStatuses = allowedTransitions(status);
  const forwardStatuses = nextStatuses.filter(isForward);

  const changeStatus = async (next: RequestStatus, body: { adminResponse?: string | null; rejectionReason?: string }) => {
    const result = await apiRequest(`/api/requests/${requestId}/status`, { method: "PATCH", body: { status: next, ...body } });
    if (result.error) {
      toast.error(result.error.message);
      return result.error;
    }
    toast.success(`Status permintaan diubah menjadi ${requestStatusLabels[next]}. Klien sudah diberi tahu.`);
    router.refresh();
    return null;
  };

  const submitForward = (next: RequestStatus) =>
    handleSubmit(async ({ adminResponse }) => {
      const error = await changeStatus(next, { adminResponse });
      if (error) setFieldErrors(setError, error.fields);
    });

  if (nextStatuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tindak Lanjut</CardTitle>
          <CardDescription>
            Permintaan ini sudah {status === "REJECTED" ? "ditolak" : "selesai"}. Tidak ada tindakan lanjutan.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tindak Lanjut</CardTitle>
        <CardDescription>Pilih langkah berikutnya. Klien mendapat notifikasi setiap status berubah.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {forwardStatuses.length > 0 && (
          <FormField
            label="Tanggapan untuk klien"
            htmlFor="admin-response"
            error={errors.adminResponse?.message}
            hint="Opsional. Tampil di portal klien dan menggantikan tanggapan sebelumnya."
          >
            <Textarea
              id="admin-response"
              rows={3}
              placeholder="Contoh: Sedang kami kerjakan, perkiraan selesai besok."
              aria-invalid={Boolean(errors.adminResponse)}
              {...register("adminResponse")}
            />
          </FormField>
        )}
        <div className="flex flex-wrap gap-2">
          {forwardStatuses.map((next) => (
            <Button key={next} type="button" disabled={isSubmitting} onClick={submitForward(next)}>
              {isSubmitting ? uiText.processing : actionLabels[next]}
            </Button>
          ))}
          {nextStatuses.includes("REJECTED") && (
            <RejectDialog
              disabled={isSubmitting}
              onReject={(rejectionReason) => changeStatus("REJECTED", { rejectionReason })}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
