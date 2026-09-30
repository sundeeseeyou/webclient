"use client";

import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ClientProfileInput } from "@/lib/validations/client";

// Dipakai form "Tambah Klien" dan dialog "Ubah Klien"; keduanya membungkus komponen ini dengan <FormProvider>.
export function ClientProfileFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ClientProfileInput>();

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField label="Nama perusahaan" htmlFor="company" error={errors.company?.message} required>
        <Input id="company" placeholder="Contoh: CV Kopi Nusantara" aria-invalid={Boolean(errors.company)} {...register("company")} />
      </FormField>
      <FormField label="Nama PIC" htmlFor="name" error={errors.name?.message} hint="Orang yang dihubungi untuk urusan website." required>
        <Input id="name" placeholder="Contoh: Budi Santoso" aria-invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>
      <FormField label="Email kontak" htmlFor="email" error={errors.email?.message} required>
        <Input
          id="email"
          type="email"
          autoComplete="off"
          placeholder="nama@perusahaan.co.id"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>
      <FormField label="Nomor telepon" htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" type="tel" placeholder="Contoh: 0812 3456 7890" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
      </FormField>
      <FormField label="Alamat" htmlFor="address" error={errors.address?.message} className="sm:col-span-2">
        <Textarea id="address" rows={2} aria-invalid={Boolean(errors.address)} {...register("address")} />
      </FormField>
      <FormField
        label="Catatan"
        htmlFor="notes"
        error={errors.notes?.message}
        hint="Hanya terlihat oleh admin."
        className="sm:col-span-2"
      >
        <Textarea id="notes" rows={3} aria-invalid={Boolean(errors.notes)} {...register("notes")} />
      </FormField>
    </div>
  );
}
