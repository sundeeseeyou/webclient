"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, type DefaultValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { InvoiceItemsFields } from "@/components/admin/invoices/invoice-items-fields";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { uiText } from "@/lib/labels";
import { type InvoiceInput, type InvoiceValues, invoiceSchema } from "@/lib/validations/invoice";

type InvoiceProjectOption = { id: string; name: string; company: string };

type InvoiceFormProps = {
  defaultValues: DefaultValues<InvoiceInput>;
  // Diisi bila proyek sudah pasti (dibuka dari halaman proyek, atau saat mengubah); kosong berarti admin memilih proyek.
  lockedProject?: { company: string; name: string };
  projects?: InvoiceProjectOption[];
  // Diisi saat mengubah draf; kosong berarti membuat invoice baru.
  invoice?: { id: string; number: string };
  cancelHref?: string;
  onSaved?: () => void;
  onCancel?: () => void;
};

function ReadOnlyField({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <p className="text-sm leading-none font-medium">{label}</p>
      <p className={`flex min-h-10 items-center rounded-md border bg-muted/40 px-3 py-2 wrap-break-word ${muted ? "text-muted-foreground" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export function InvoiceForm({ defaultValues, lockedProject, projects = [], invoice, cancelHref, onSaved, onCancel }: InvoiceFormProps) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceInput, unknown, InvoiceValues>({ resolver: zodResolver(invoiceSchema), defaultValues });

  const onSubmit = handleSubmit(async (values) => {
    const result = await apiRequest<{ id: string; number?: string }>(invoice ? `/api/invoices/${invoice.id}` : "/api/invoices", {
      method: invoice ? "PATCH" : "POST",
      body: values,
    });
    if (result.error) {
      setFieldErrors(setError, result.error.fields);
      toast.error(result.error.message);
      return;
    }
    if (invoice) {
      toast.success("Invoice berhasil diperbarui.");
      router.refresh();
      onSaved?.();
    } else {
      toast.success(`Invoice ${result.data.number ?? ""} berhasil dibuat sebagai draf.`);
      router.push(`/admin/invoices/${result.data.id}`);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {lockedProject ? (
          <>
            <ReadOnlyField label="Klien" value={lockedProject.company} />
            <ReadOnlyField label="Proyek" value={lockedProject.name} />
          </>
        ) : (
          <FormField label="Proyek" htmlFor="projectId" error={errors.projectId?.message} required className="sm:col-span-2">
            <Controller
              control={control}
              name="projectId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="projectId" className="w-full" aria-invalid={Boolean(errors.projectId)}>
                    <SelectValue placeholder="Pilih proyek yang akan ditagih" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.company} · {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <ReadOnlyField
          label="Nomor invoice"
          value={invoice?.number ?? "Nomor dibuat otomatis saat disimpan"}
          muted={!invoice}
        />
        <FormField label="Tanggal terbit" htmlFor="issuedDate" error={errors.issuedDate?.message} required>
          <Input id="issuedDate" type="date" aria-invalid={Boolean(errors.issuedDate)} {...register("issuedDate")} />
        </FormField>
        <FormField label="Jatuh tempo" htmlFor="dueDate" error={errors.dueDate?.message} required>
          <Input id="dueDate" type="date" aria-invalid={Boolean(errors.dueDate)} {...register("dueDate")} />
        </FormField>
      </div>
      <fieldset className="space-y-3">
        <legend className="mb-3 text-base font-medium">Item tagihan</legend>
        <InvoiceItemsFields control={control} register={register} errors={errors} />
      </fieldset>
      <FormField
        label="Catatan"
        htmlFor="notes"
        error={errors.notes?.message}
        hint="Opsional. Tampil di invoice dan PDF, misalnya info rekening atau termin pembayaran."
      >
        <Textarea id="notes" rows={3} aria-invalid={Boolean(errors.notes)} {...register("notes")} />
      </FormField>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {uiText.cancel}
          </Button>
        ) : (
          <Button type="button" variant="outline" asChild>
            <Link href={cancelHref ?? "/admin/invoices"}>{uiText.cancel}</Link>
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? uiText.saving : invoice ? uiText.save : "Simpan sebagai Draf"}
        </Button>
      </div>
    </form>
  );
}
