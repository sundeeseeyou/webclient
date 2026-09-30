"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import { PiArrowCounterClockwise } from "react-icons/pi";
import { toast } from "sonner";
import { RequestFields } from "@/components/portal/request-fields";
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
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { uiText } from "@/lib/labels";
import { type RequestInput, type RequestValues, requestSchema } from "@/lib/validations/request";

const defaultValues: DefaultValues<RequestInput> = {
  websiteId: "",
  projectId: "",
  type: "DESIGN_REVISION",
  title: "",
  description: "",
  referenceUrl: "",
};

export function RevisionDialog({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<RequestInput, unknown, RequestValues>({ resolver: zodResolver(requestSchema), defaultValues });
  const {
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = form;

  // Website dan proyek ditentukan server dari proyek ini, jadi yang dikirim hanya isi permintaan.
  const onSubmit = handleSubmit(async ({ type, priority, title, description, referenceUrl }) => {
    const result = await apiRequest(`/api/projects/${projectId}/request-revision`, {
      method: "POST",
      body: { type, priority, title, description, referenceUrl },
    });
    if (result.error) {
      setFieldErrors(setError, result.error.fields);
      toast.error(result.error.message);
      return;
    }
    toast.success("Permintaan revisi terkirim. Tim Boowat akan segera mengerjakannya.");
    reset();
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && setOpen(next)}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="bg-card">
          <PiArrowCounterClockwise />
          Minta Revisi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Minta revisi</DialogTitle>
          <DialogDescription>
            Jelaskan bagian yang perlu diperbaiki. Permintaan ini akan tampil di menu Permintaan dan status proyek berubah
            menjadi Revisi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <RequestFields form={form} idPrefix="revision" />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                {uiText.cancel}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mengirim..." : "Kirim Permintaan Revisi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
