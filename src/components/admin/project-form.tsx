"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, type DefaultValues, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { projectTypeLabels, uiText } from "@/lib/labels";
import { type ProjectInput, type ProjectValues, projectSchema } from "@/lib/validations/project";

// Radix Select tidak menerima value kosong, jadi "tanpa website" diwakili nilai khusus ini.
const NO_WEBSITE = "none";

export type ClientOption = { id: string; company: string; websites: { id: string; domain: string }[] };

type ProjectFormProps = {
  clients: ClientOption[];
  defaultValues: DefaultValues<ProjectInput>;
  // Diisi saat mengubah proyek; kosong berarti membuat proyek baru.
  projectId?: string;
  onSaved?: () => void;
  onCancel?: () => void;
};

export function ProjectForm({ clients, defaultValues, projectId, onSaved, onCancel }: ProjectFormProps) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput, unknown, ProjectValues>({ resolver: zodResolver(projectSchema), defaultValues });
  const clientId = useWatch({ control, name: "clientId" });
  const websites = clients.find((client) => client.id === clientId)?.websites ?? [];

  const onSubmit = handleSubmit(async (values) => {
    const result = await apiRequest<{ id: string }>(projectId ? `/api/projects/${projectId}` : "/api/projects", {
      method: projectId ? "PATCH" : "POST",
      body: values,
    });
    if (result.error) {
      setFieldErrors(setError, result.error.fields);
      toast.error(result.error.message);
      return;
    }
    if (projectId) {
      toast.success("Data proyek berhasil diperbarui.");
      router.refresh();
      onSaved?.();
    } else {
      toast.success("Proyek berhasil dibuat.");
      router.push(`/admin/projects/${result.data.id}`);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Nama proyek" htmlFor="name" error={errors.name?.message} required className="sm:col-span-2">
          <Input id="name" placeholder="Contoh: Redesain Halaman Layanan" aria-invalid={Boolean(errors.name)} {...register("name")} />
        </FormField>
        <FormField label="Jenis proyek" htmlFor="type" error={errors.type?.message} required>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="type" className="w-full" aria-invalid={Boolean(errors.type)}>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(projectTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Klien" htmlFor="clientId" error={errors.clientId?.message} required>
          <Controller
            control={control}
            name="clientId"
            render={({ field }) => (
              <Select
                value={field.value}
                disabled={Boolean(projectId)}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("websiteId", "");
                }}
              >
                <SelectTrigger id="clientId" className="w-full" aria-invalid={Boolean(errors.clientId)}>
                  <SelectValue placeholder="Pilih klien" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField
          label="Website"
          htmlFor="websiteId"
          error={errors.websiteId?.message}
          hint={clientId && websites.length === 0 ? "Klien ini belum punya website." : undefined}
        >
          <Controller
            control={control}
            name="websiteId"
            render={({ field }) => (
              <Select
                value={field.value || NO_WEBSITE}
                disabled={!clientId}
                onValueChange={(value) => field.onChange(value === NO_WEBSITE ? "" : value)}
              >
                <SelectTrigger id="websiteId" className="w-full" aria-invalid={Boolean(errors.websiteId)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_WEBSITE}>Tanpa website</SelectItem>
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
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Tanggal mulai" htmlFor="startDate" error={errors.startDate?.message} required>
          <Input id="startDate" type="date" aria-invalid={Boolean(errors.startDate)} {...register("startDate")} />
        </FormField>
        <FormField label="Tanggal selesai" htmlFor="endDate" error={errors.endDate?.message} hint="Kosongkan bila belum pasti.">
          <Input id="endDate" type="date" aria-invalid={Boolean(errors.endDate)} {...register("endDate")} />
        </FormField>
      </div>
      <FormField label="Deskripsi" htmlFor="description" error={errors.description?.message}>
        <Textarea
          id="description"
          rows={4}
          placeholder="Ringkasan pekerjaan yang akan dilakukan"
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
      </FormField>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {uiText.cancel}
          </Button>
        ) : (
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/projects">{uiText.cancel}</Link>
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? uiText.saving : uiText.save}
        </Button>
      </div>
    </form>
  );
}
