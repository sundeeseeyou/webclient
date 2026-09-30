"use client";

import { Controller, type UseFormReturn, useWatch } from "react-hook-form";
import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requestPriorityLabels, requestTypeLabels } from "@/lib/labels";
import { slaTargetLabel } from "@/lib/sla";
import type { RequestInput, RequestValues } from "@/lib/validations/request";

type RequestFieldsProps = {
  form: UseFormReturn<RequestInput, unknown, RequestValues>;
  // Awalan id agar form di halaman dan di dialog tidak bentrok.
  idPrefix: string;
};

// Kolom yang sama untuk form "Ajukan Permintaan" dan dialog "Minta Revisi".
export function RequestFields({ form, idPrefix }: RequestFieldsProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const priority = useWatch({ control, name: "priority" });
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Jenis permintaan" htmlFor={id("type")} error={errors.type?.message} required>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id={id("type")} className="w-full" aria-invalid={Boolean(errors.type)} onBlur={field.onBlur}>
                  <SelectValue placeholder="Pilih jenis permintaan" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(requestTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Prioritas" htmlFor={id("priority")} error={errors.priority?.message} required>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id={id("priority")} className="w-full" aria-invalid={Boolean(errors.priority)} onBlur={field.onBlur}>
                  <SelectValue placeholder="Pilih seberapa mendesak" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(requestPriorityLabels).map(([value, label]) => (
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
      {priority && (
        <p role="status" className="rounded-lg bg-primary/5 px-3 py-2 text-primary">
          Perkiraan waktu respon: <span className="font-medium">{slaTargetLabel(priority)}</span>
        </p>
      )}
      <FormField label="Judul" htmlFor={id("title")} error={errors.title?.message} required>
        <Input
          id={id("title")}
          placeholder="Contoh: Ganti foto banner di halaman depan"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
      </FormField>
      <FormField label="Deskripsi" htmlFor={id("description")} error={errors.description?.message} required>
        <Textarea
          id={id("description")}
          rows={5}
          placeholder="Jelaskan perubahan yang Anda inginkan, di halaman mana, dan hasil yang diharapkan."
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
      </FormField>
      <FormField
        label="Link referensi"
        htmlFor={id("referenceUrl")}
        error={errors.referenceUrl?.message}
        hint="Opsional. Misalnya link Google Drive berisi foto, dokumen, atau contoh desain."
      >
        <Input
          id={id("referenceUrl")}
          type="url"
          inputMode="url"
          placeholder="https://drive.google.com/..."
          aria-invalid={Boolean(errors.referenceUrl)}
          {...register("referenceUrl")}
        />
      </FormField>
    </>
  );
}
