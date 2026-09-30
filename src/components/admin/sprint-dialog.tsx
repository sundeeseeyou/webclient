"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { SprintItem } from "@/components/admin/project-types";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/dates";
import { sprintStatusLabels, uiText } from "@/lib/labels";
import { sprintSchema } from "@/lib/validations/project";

type SprintFormProps = {
  projectId: string;
  // Diisi saat mengubah sprint; kosong berarti menambah sprint baru.
  sprint?: SprintItem;
  defaultName?: string;
};

type SprintDialogProps = SprintFormProps & { trigger: React.ReactNode };

export function SprintDialog({ trigger, ...formProps }: SprintDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formProps.sprint ? "Ubah sprint" : "Tambah sprint"}</DialogTitle>
          <DialogDescription>Sprint adalah satu tahap kerja dengan tanggal mulai dan selesai.</DialogDescription>
        </DialogHeader>
        <SprintForm {...formProps} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SprintForm({ projectId, sprint, defaultName, onDone }: SprintFormProps & { onDone: () => void }) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(sprintSchema),
    defaultValues: sprint
      ? {
          name: sprint.name,
          goal: sprint.goal ?? "",
          startDate: toDateInputValue(sprint.startDate),
          endDate: toDateInputValue(sprint.endDate),
          status: sprint.status,
        }
      : { name: defaultName ?? "", goal: "", startDate: toDateInputValue(new Date()), endDate: "", status: "PLANNED" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await apiRequest(sprint ? `/api/sprints/${sprint.id}` : `/api/projects/${projectId}/sprints`, {
      method: sprint ? "PATCH" : "POST",
      body: values,
    });
    if (result.error) {
      setFieldErrors(setError, result.error.fields);
      toast.error(result.error.message);
      return;
    }
    toast.success(sprint ? "Sprint berhasil diperbarui." : "Sprint berhasil ditambahkan.");
    router.refresh();
    onDone();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Nama sprint" htmlFor="sprint-name" error={errors.name?.message} required>
        <Input id="sprint-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>
      <FormField label="Tujuan" htmlFor="sprint-goal" error={errors.goal?.message} hint="Hasil yang ingin dicapai di sprint ini.">
        <Textarea id="sprint-goal" rows={2} aria-invalid={Boolean(errors.goal)} {...register("goal")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tanggal mulai" htmlFor="sprint-start" error={errors.startDate?.message} required>
          <Input id="sprint-start" type="date" aria-invalid={Boolean(errors.startDate)} {...register("startDate")} />
        </FormField>
        <FormField label="Tanggal selesai" htmlFor="sprint-end" error={errors.endDate?.message} required>
          <Input id="sprint-end" type="date" aria-invalid={Boolean(errors.endDate)} {...register("endDate")} />
        </FormField>
      </div>
      <FormField label="Status" htmlFor="sprint-status" error={errors.status?.message} required>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="sprint-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sprintStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            {uiText.cancel}
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? uiText.saving : uiText.save}
        </Button>
      </DialogFooter>
    </form>
  );
}
