"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PiXCircle } from "react-icons/pi";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { setFieldErrors } from "@/lib/api-client";
import type { ApiError } from "@/lib/api";
import { uiText } from "@/lib/labels";
import { REJECTION_REASON_MIN, rejectionSchema } from "@/lib/validations/request";

type RejectDialogProps = {
  disabled?: boolean;
  // Mengembalikan error API (atau null bila berhasil) agar pesan per kolom bisa ditampilkan di form ini.
  onReject: (rejectionReason: string) => Promise<ApiError | null>;
};

export function RejectDialog({ disabled, onReject }: RejectDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(rejectionSchema), defaultValues: { rejectionReason: "" } });

  const onSubmit = handleSubmit(async ({ rejectionReason }) => {
    const error = await onReject(rejectionReason);
    if (error) {
      setFieldErrors(setError, error.fields);
      return;
    }
    reset();
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && setOpen(next)}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled} className="text-danger hover:text-danger">
          <PiXCircle />
          Tolak
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak permintaan</DialogTitle>
          <DialogDescription>Alasan penolakan akan terlihat oleh klien di portal. Tulis dengan jelas dan sopan.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            label="Alasan penolakan"
            htmlFor="rejection-reason"
            error={errors.rejectionReason?.message}
            hint={`Minimal ${REJECTION_REASON_MIN} karakter.`}
            required
          >
            <Textarea
              id="rejection-reason"
              rows={4}
              placeholder="Contoh: Fitur ini di luar paket pemeliharaan. Penawaran terpisah akan kami kirim lewat email."
              aria-invalid={Boolean(errors.rejectionReason)}
              {...register("rejectionReason")}
            />
          </FormField>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                {uiText.cancel}
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? uiText.processing : "Tolak permintaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
