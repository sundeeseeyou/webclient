"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PiPlus } from "react-icons/pi";
import { toast } from "sonner";
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
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { uiText } from "@/lib/labels";
import { clientAccountSchema, type ClientAccountInput } from "@/lib/validations/client";

const emptyAccount: ClientAccountInput = { name: "", email: "", password: "" };

export function AddAccountDialog({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(clientAccountSchema), defaultValues: emptyAccount });

  const onOpenChange = (next: boolean) => {
    if (isSubmitting) return;
    if (next) reset(emptyAccount);
    setOpen(next);
  };

  const onSubmit = handleSubmit(async (values) => {
    const result = await apiRequest(`/api/clients/${clientId}/users`, { method: "POST", body: values });
    if (result.error) {
      setFieldErrors(setError, result.error.fields);
      toast.error(result.error.message);
      return;
    }
    toast.success("Akun login berhasil ditambahkan.");
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PiPlus className="size-5" />
          Tambah Akun
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah akun login</DialogTitle>
          <DialogDescription>Akun ini dipakai klien untuk masuk ke portal klien.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FormField label="Nama pengguna" htmlFor="new-account-name" error={errors.name?.message} required>
            <Input id="new-account-name" placeholder="Nama yang tampil di portal" aria-invalid={Boolean(errors.name)} {...register("name")} />
          </FormField>
          <FormField label="Email login" htmlFor="new-account-email" error={errors.email?.message} required>
            <Input
              id="new-account-email"
              type="email"
              autoComplete="off"
              placeholder="nama@perusahaan.co.id"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </FormField>
          <FormField
            label="Password awal"
            htmlFor="new-account-password"
            error={errors.password?.message}
            hint="Minimal 8 karakter. Sampaikan ke klien secara langsung."
            required
          >
            <Input
              id="new-account-password"
              autoComplete="new-password"
              spellCheck={false}
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </FormField>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                {uiText.cancel}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? uiText.saving : "Tambah Akun"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
