"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ClientProfileFields } from "@/components/admin/clients/client-profile-fields";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { uiText } from "@/lib/labels";
import { newClientFormSchema, type NewClientFormInput } from "@/lib/validations/client";

const defaultValues: NewClientFormInput = {
  company: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  withAccount: true,
  account: { name: "", email: "", password: "" },
};

export function NewClientForm() {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const form = useForm({ resolver: zodResolver(newClientFormSchema), defaultValues });
  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = form;
  const withAccount = useWatch({ control, name: "withAccount" });
  const isBusy = isSubmitting || isNavigating;

  const onSubmit = handleSubmit(async ({ withAccount, account, ...profile }) => {
    const result = await apiRequest<{ id: string }>("/api/clients", {
      method: "POST",
      body: { ...profile, account: withAccount ? account : null },
    });
    if (result.error) {
      setFieldErrors(setError, result.error.fields);
      toast.error(result.error.message);
      return;
    }
    toast.success(withAccount ? "Klien dan akun login berhasil ditambahkan." : "Klien berhasil ditambahkan.");
    startNavigation(() => router.push(`/admin/clients/${result.data.id}`));
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data klien</CardTitle>
            <CardDescription>Kolom bertanda * wajib diisi.</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientProfileFields />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Akun login</CardTitle>
            <CardDescription>Dipakai klien untuk masuk ke portal klien dan memantau website, proyek, serta invoice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-primary"
                {...register("withAccount", { onChange: () => clearErrors("account") })}
              />
              <span>
                <span className="block font-medium">Buatkan akun login</span>
                <span className="block text-muted-foreground">Hilangkan centang kalau akun akan dibuat belakangan.</span>
              </span>
            </label>

            {withAccount ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Nama pengguna" htmlFor="account-name" error={errors.account?.name?.message} required>
                  <Input id="account-name" placeholder="Nama yang tampil di portal" aria-invalid={Boolean(errors.account?.name)} {...register("account.name")} />
                </FormField>
                <FormField label="Email login" htmlFor="account-email" error={errors.account?.email?.message} required>
                  <Input
                    id="account-email"
                    type="email"
                    autoComplete="off"
                    placeholder="nama@perusahaan.co.id"
                    aria-invalid={Boolean(errors.account?.email)}
                    {...register("account.email")}
                  />
                </FormField>
                <FormField
                  label="Password awal"
                  htmlFor="account-password"
                  error={errors.account?.password?.message}
                  hint="Minimal 8 karakter. Sampaikan ke klien secara langsung."
                  required
                >
                  <Input
                    id="account-password"
                    autoComplete="new-password"
                    spellCheck={false}
                    aria-invalid={Boolean(errors.account?.password)}
                    {...register("account.password")}
                  />
                </FormField>
              </div>
            ) : (
              <p className="text-muted-foreground">Akun login bisa ditambahkan nanti dari halaman detail klien, tab Akun Login.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline">
            <Link href="/admin/clients">{uiText.cancel}</Link>
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy ? uiText.saving : "Simpan Klien"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
