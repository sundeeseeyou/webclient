"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { toast } from "sonner";
import { OptionSelect, toOptions } from "@/components/admin/websites/option-select";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { platformLabels, uiText, websiteStatusLabels } from "@/lib/labels";
import { websiteSchema, type WebsiteInput, type WebsiteValues } from "@/lib/validations/website";

export type ClientOption = { id: string; company: string };

type WebsiteFormProps = {
  clients: ClientOption[];
  defaultValues: DefaultValues<WebsiteInput>;
  // Ada websiteId berarti mode ubah (PATCH); tanpa websiteId berarti tambah (POST) lalu pindah ke detail.
  websiteId?: string;
  onDone?: () => void;
  cancelHref?: string;
};

const platformOptions = toOptions(platformLabels);
const statusOptions = toOptions(websiteStatusLabels);

export function WebsiteForm({ clients, defaultValues, websiteId, onDone, cancelHref = "/admin/clients" }: WebsiteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<WebsiteInput, unknown, WebsiteValues>({ resolver: zodResolver(websiteSchema), defaultValues });

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const result = await apiRequest<{ id: string }>(websiteId ? `/api/websites/${websiteId}` : "/api/websites", {
        method: websiteId ? "PATCH" : "POST",
        body: values,
      });
      if (result.error) {
        setFieldErrors(setError, result.error.fields);
        toast.error(result.error.message);
        return;
      }
      if (websiteId) {
        toast.success("Data website berhasil diperbarui.");
        router.refresh();
        onDone?.();
      } else {
        toast.success("Website berhasil ditambahkan.");
        router.push(`/admin/websites/${result.data.id}`);
      }
    }),
  );

  const clientOptions = clients.map((client) => ({ value: client.id, label: client.company }));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Klien" htmlFor="clientId" error={errors.clientId?.message} required className="sm:col-span-2">
          <Controller
            control={control}
            name="clientId"
            render={({ field }) => (
              <OptionSelect
                id="clientId"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={clientOptions}
                placeholder="Pilih klien"
                invalid={Boolean(errors.clientId)}
              />
            )}
          />
        </FormField>
        <FormField label="Domain" htmlFor="domain" error={errors.domain?.message} hint="Tanpa http:// atau https://" required>
          <Input id="domain" placeholder="namadomain.co.id" aria-invalid={Boolean(errors.domain)} {...register("domain")} />
        </FormField>
        <FormField label="Platform" htmlFor="platform" error={errors.platform?.message} required>
          <Controller
            control={control}
            name="platform"
            render={({ field }) => (
              <OptionSelect
                id="platform"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={platformOptions}
                placeholder="Pilih platform"
                invalid={Boolean(errors.platform)}
              />
            )}
          />
        </FormField>
        <FormField label="Penyedia hosting" htmlFor="hostingProvider" error={errors.hostingProvider?.message}>
          <Input id="hostingProvider" placeholder="Contoh: Niagahoster" {...register("hostingProvider")} />
        </FormField>
        <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <OptionSelect
                id="status"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={statusOptions}
                placeholder="Pilih status"
                invalid={Boolean(errors.status)}
              />
            )}
          />
        </FormField>
        <FormField label="Tanggal perpanjangan domain" htmlFor="domainRenewAt" error={errors.domainRenewAt?.message}>
          <Input id="domainRenewAt" type="date" aria-invalid={Boolean(errors.domainRenewAt)} {...register("domainRenewAt")} />
        </FormField>
        <FormField label="Tanggal perpanjangan hosting" htmlFor="hostingRenewAt" error={errors.hostingRenewAt?.message}>
          <Input id="hostingRenewAt" type="date" aria-invalid={Boolean(errors.hostingRenewAt)} {...register("hostingRenewAt")} />
        </FormField>
        <FormField
          label="ID properti GA4"
          htmlFor="ga4PropertyId"
          error={errors.ga4PropertyId?.message}
          hint="Opsional. Diisi agar pengunjung tersinkron otomatis dari Google Analytics."
        >
          <Input id="ga4PropertyId" inputMode="numeric" placeholder="412345678" aria-invalid={Boolean(errors.ga4PropertyId)} {...register("ga4PropertyId")} />
        </FormField>
        <FormField
          label="Alamat API WordPress"
          htmlFor="wpApiUrl"
          error={errors.wpApiUrl?.message}
          hint="Opsional. Diisi agar artikel bisa disinkronkan dari WordPress."
        >
          <Input id="wpApiUrl" type="url" placeholder="https://namadomain.com/wp-json" aria-invalid={Boolean(errors.wpApiUrl)} {...register("wpApiUrl")} />
        </FormField>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onDone ? (
          <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
            {uiText.cancel}
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={cancelHref}>{uiText.cancel}</Link>
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? uiText.saving : uiText.save}
        </Button>
      </div>
    </form>
  );
}
