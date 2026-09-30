"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { RequestType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequestFields } from "@/components/portal/request-fields";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { uiText } from "@/lib/labels";
import {
  type RequestInput,
  type RequestValues,
  requestSchema,
  requestWithWebsiteSchema,
} from "@/lib/validations/request";

type RequestFormProps = {
  websites: { id: string; domain: string }[];
  // Terisi bila form dibuka dari halaman proyek (?projectId=).
  project: { id: string; name: string; websiteId: string | null } | null;
  defaultType?: RequestType;
};

export function RequestForm({ websites, project, defaultType }: RequestFormProps) {
  const router = useRouter();
  const form = useForm<RequestInput, unknown, RequestValues>({
    resolver: zodResolver(websites.length > 0 ? requestWithWebsiteSchema : requestSchema),
    defaultValues: {
      websiteId: project?.websiteId ?? (websites.length === 1 ? websites[0].id : ""),
      projectId: project?.id ?? "",
      type: defaultType,
      title: "",
      description: "",
      referenceUrl: "",
    },
  });
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    const result = await apiRequest<{ id: string }>("/api/requests", { method: "POST", body: values });
    if (result.error) {
      setFieldErrors(setError, result.error.fields);
      toast.error(result.error.message);
      return;
    }
    toast.success("Permintaan berhasil dikirim. Tim Boowat akan segera meninjaunya.");
    router.push("/portal/requests");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {project && (
        <p className="rounded-lg border bg-muted/40 px-3 py-2">
          Terkait proyek: <span className="font-medium">{project.name}</span>
        </p>
      )}
      {websites.length > 0 && (
        <FormField label="Website" htmlFor="request-websiteId" error={errors.websiteId?.message} required>
          <Controller
            control={control}
            name="websiteId"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="request-websiteId"
                  className="w-full"
                  aria-invalid={Boolean(errors.websiteId)}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder="Pilih website" />
                </SelectTrigger>
                <SelectContent>
                  {websites.map((website) => (
                    <SelectItem key={website.id} value={website.id}>
                      {website.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      )}
      <RequestFields form={form} idPrefix="request" />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href="/portal/requests">{uiText.cancel}</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Mengirim..." : "Kirim Permintaan"}
        </Button>
      </div>
    </form>
  );
}
