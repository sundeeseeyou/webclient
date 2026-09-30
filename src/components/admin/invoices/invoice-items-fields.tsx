"use client";

import { type Control, type FieldErrors, type UseFormRegister, useFieldArray, useWatch } from "react-hook-form";
import { PiPlus, PiTrash } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/format";
import { type InvoiceInput, type InvoiceValues, MAX_INVOICE_ITEMS } from "@/lib/validations/invoice";

type InvoiceItemsFieldsProps = {
  control: Control<InvoiceInput, unknown, InvoiceValues>;
  register: UseFormRegister<InvoiceInput>;
  errors: FieldErrors<InvoiceInput>;
};

// Hanya untuk tampilan; total yang tersimpan dihitung ulang oleh server dari item.
function toAmount(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

const rowGrid = "sm:grid-cols-[minmax(0,1fr)_6.5rem_9rem_8rem_2.5rem]";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="text-xs text-danger">
      {message}
    </p>
  ) : null;
}

export function InvoiceItemsFields({ control, register, errors }: InvoiceItemsFieldsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" }) ?? [];
  const subtotals = items.map((item) => toAmount(item?.qty) * toAmount(item?.unitPrice));
  const total = subtotals.reduce((sum, value) => sum + value, 0);
  const listError = errors.items?.message ?? errors.items?.root?.message;

  return (
    <div className="space-y-3">
      <div className={`hidden gap-3 text-xs font-medium text-muted-foreground sm:grid ${rowGrid}`}>
        <span>Deskripsi</span>
        <span>Jumlah</span>
        <span>Harga satuan (Rp)</span>
        <span className="text-right">Subtotal</span>
      </div>
      {fields.map((field, index) => {
        const itemErrors = errors.items?.[index];
        const id = (name: string) => `items-${index}-${name}`;
        const removeButton = (className: string) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={`text-muted-foreground hover:text-danger ${className}`}
            disabled={fields.length === 1}
            onClick={() => remove(index)}
            aria-label={`Hapus item ${index + 1}`}
          >
            <PiTrash />
          </Button>
        );

        return (
          <div key={field.id} className={`grid gap-3 rounded-lg border p-3 sm:items-start sm:rounded-none sm:border-0 sm:p-0 ${rowGrid}`}>
            <div className="flex items-center justify-between sm:hidden">
              <p className="font-medium">Item {index + 1}</p>
              {removeButton("")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={id("description")} className="sm:sr-only">
                Deskripsi
              </Label>
              <Input
                id={id("description")}
                placeholder="Contoh: Desain halaman beranda"
                aria-invalid={Boolean(itemErrors?.description)}
                {...register(`items.${index}.description`)}
              />
              <FieldError message={itemErrors?.description?.message} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:contents">
              <div className="space-y-1.5">
                <Label htmlFor={id("qty")} className="sm:sr-only">
                  Jumlah
                </Label>
                <Input
                  id={id("qty")}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  aria-invalid={Boolean(itemErrors?.qty)}
                  {...register(`items.${index}.qty`)}
                />
                <FieldError message={itemErrors?.qty?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={id("unitPrice")} className="sm:sr-only">
                  Harga satuan (Rp)
                </Label>
                <Input
                  id={id("unitPrice")}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  placeholder="0"
                  aria-invalid={Boolean(itemErrors?.unitPrice)}
                  {...register(`items.${index}.unitPrice`)}
                />
                <FieldError message={itemErrors?.unitPrice?.message} />
              </div>
            </div>
            <div className="flex items-center justify-between border-t pt-3 sm:block sm:border-0 sm:pt-2.5 sm:text-right">
              <span className="text-xs text-muted-foreground sm:hidden">Subtotal</span>
              <span className="font-medium tabular-nums">{formatRupiah(subtotals[index] ?? 0)}</span>
            </div>
            {removeButton("hidden sm:mt-1 sm:inline-flex")}
          </div>
        );
      })}
      <FieldError message={listError} />
      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          disabled={fields.length >= MAX_INVOICE_ITEMS}
          onClick={() => append({ description: "", qty: 1, unitPrice: "" })}
        >
          <PiPlus />
          Tambah item
        </Button>
        <div className="flex items-baseline justify-between gap-6 sm:justify-end">
          <span className="text-muted-foreground">Total</span>
          <span className="text-base font-semibold tabular-nums">{formatRupiah(total)}</span>
        </div>
      </div>
    </div>
  );
}
