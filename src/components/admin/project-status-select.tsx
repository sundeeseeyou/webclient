"use client";

import type { ProjectStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/api-client";
import { projectStatusLabels } from "@/lib/labels";

type ProjectStatusSelectProps = {
  projectId: string;
  status: ProjectStatus;
};

// Dipasang dengan key={status} oleh induknya, jadi nilai lokal ikut direset setelah data server diperbarui.
export function ProjectStatusSelect({ projectId, status }: ProjectStatusSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState<string>(status);
  const [isPending, startTransition] = useTransition();

  const change = (next: string) => {
    setValue(next);
    startTransition(async () => {
      const result = await apiRequest<{ status: ProjectStatus }>(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: { status: next },
      });
      if (result.error) {
        setValue(status);
        toast.error(result.error.message);
        return;
      }
      toast.success(
        result.data.status === "WAITING_APPROVAL"
          ? "Status diubah. Klien sudah diberi tahu untuk memeriksa dan menyetujui hasil."
          : `Status proyek diubah menjadi ${projectStatusLabels[result.data.status]}.`,
      );
      router.refresh();
    });
  };

  return (
    <FormField label="Ubah status" htmlFor="project-status">
      <Select value={value} onValueChange={change} disabled={isPending}>
        <SelectTrigger id="project-status" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(projectStatusLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
