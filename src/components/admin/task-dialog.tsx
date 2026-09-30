"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { TaskItem } from "@/components/admin/project-types";
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
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { uiText } from "@/lib/labels";
import { taskSchema } from "@/lib/validations/project";

type TaskFormProps = {
  sprintId: string;
  // Diisi saat mengubah task; kosong berarti menambah task baru ke kolom "Belum Dikerjakan".
  task?: TaskItem;
};

type TaskDialogProps = TaskFormProps & { trigger: React.ReactNode };

export function TaskDialog({ trigger, ...formProps }: TaskDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formProps.task ? "Ubah task" : "Tambah task"}</DialogTitle>
          <DialogDescription>
            {formProps.task ? "Perbarui judul, deskripsi, atau penanggung jawab." : "Task baru masuk ke kolom Belum Dikerjakan."}
          </DialogDescription>
        </DialogHeader>
        <TaskForm {...formProps} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({ sprintId, task, onDone }: TaskFormProps & { onDone: () => void }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: task?.title ?? "", description: task?.description ?? "", assignee: task?.assignee ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await apiRequest(task ? `/api/tasks/${task.id}` : `/api/sprints/${sprintId}/tasks`, {
      method: task ? "PATCH" : "POST",
      body: values,
    });
    if (result.error) {
      setFieldErrors(setError, result.error.fields);
      toast.error(result.error.message);
      return;
    }
    toast.success(task ? "Task berhasil diperbarui." : "Task berhasil ditambahkan.");
    router.refresh();
    onDone();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Judul task" htmlFor="task-title" error={errors.title?.message} required>
        <Input id="task-title" placeholder="Contoh: Desain halaman beranda" aria-invalid={Boolean(errors.title)} {...register("title")} />
      </FormField>
      <FormField label="Deskripsi" htmlFor="task-description" error={errors.description?.message}>
        <Textarea id="task-description" rows={3} aria-invalid={Boolean(errors.description)} {...register("description")} />
      </FormField>
      <FormField label="Penanggung jawab" htmlFor="task-assignee" error={errors.assignee?.message}>
        <Input id="task-assignee" placeholder="Nama anggota tim" aria-invalid={Boolean(errors.assignee)} {...register("assignee")} />
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
