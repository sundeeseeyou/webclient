"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ClientProfileFields } from "@/components/admin/clients/client-profile-fields";
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
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { uiText } from "@/lib/labels";
import { clientProfileSchema, type ClientProfileInput } from "@/lib/validations/client";

type EditableClient = {
  id: string;
  company: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
};

function toFormValues(client: EditableClient): ClientProfileInput {
  return {
    company: client.company,
    name: client.name,
    email: client.email,
    phone: client.phone ?? "",
    address: client.address ?? "",
    notes: client.notes ?? "",
  };
}

export function EditClientDialog({ client }: { client: EditableClient }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm({ resolver: zodResolver(clientProfileSchema), defaultValues: toFormValues(client) });
  const {
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = form;

  const onOpenChange = (next: boolean) => {
    if (isSubmitting) return;
    if (next) reset(toFormValues(client));
    setOpen(next);
  };

  const onSubmit = handleSubmit(async (values) => {
    const result = await apiRequest(`/api/clients/${client.id}`, { method: "PATCH", body: values });
    if (result.error) {
      setFieldErrors(setError, result.error.fields);
      toast.error(result.error.message);
      return;
    }
    toast.success(uiText.saved);
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{uiText.edit}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ubah data klien</DialogTitle>
          <DialogDescription>Email login klien tidak ikut berubah. Kelola akun login di tab Akun Login.</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <ClientProfileFields />
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
