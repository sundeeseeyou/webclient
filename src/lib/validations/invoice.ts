import { z } from "zod";
import { dateField, optionalText, requiredText } from "@/lib/validations/common";

export const MAX_INVOICE_ITEMS = 50;
const MAX_QTY = 10_000;
const MAX_UNIT_PRICE = 10_000_000_000;
// Kolom amount bertipe Decimal(14,2), jadi total harus di bawah 1 triliun.
const MAX_TOTAL = 999_999_999_999;

const DUE_DATE_ERROR = "Jatuh tempo tidak boleh sebelum tanggal terbit";

// Isian kosong ditolak dulu, karena z.coerce mengubah "" menjadi 0 yang lolos sebagai harga Rp 0.
function requiredNumber(label: string) {
  return z
    .custom<unknown>((value) => (typeof value === "string" ? value.trim() !== "" : value != null), `${label} wajib diisi`)
    .pipe(z.coerce.number({ message: `${label} harus berupa angka` }).int(`${label} harus angka bulat`));
}

const invoiceItemSchema = z.object({
  description: requiredText("Deskripsi item", 200),
  qty: requiredNumber("Jumlah").pipe(
    z.number().min(1, "Jumlah minimal 1").max(MAX_QTY, `Jumlah maksimal ${MAX_QTY.toLocaleString("id-ID")}`),
  ),
  unitPrice: requiredNumber("Harga satuan").pipe(
    z.number().min(0, "Harga satuan tidak boleh negatif").max(MAX_UNIT_PRICE, "Harga satuan terlalu besar"),
  ),
});

type InvoiceDraft = { issuedDate: string; dueDate: string; items: { qty: number; unitPrice: number }[] };

// Tanggal berformat "YYYY-MM-DD" sehingga urutannya bisa dibandingkan langsung sebagai teks.
const hasValidDueDate = (value: InvoiceDraft) => value.dueDate >= value.issuedDate;
const dueDateIssue = { message: DUE_DATE_ERROR, path: ["dueDate"] };

const hasValidTotal = (value: InvoiceDraft) =>
  value.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0) <= MAX_TOTAL;
const totalIssue = { message: "Total invoice terlalu besar", path: ["items"] };

const invoiceFields = z.object({
  issuedDate: dateField("Tanggal terbit"),
  dueDate: dateField("Jatuh tempo"),
  notes: optionalText("Catatan", 1000),
  items: z
    .array(invoiceItemSchema)
    .min(1, "Tambahkan minimal 1 item")
    .max(MAX_INVOICE_ITEMS, `Maksimal ${MAX_INVOICE_ITEMS} item per invoice`),
});

export const invoiceSchema = invoiceFields
  .extend({ projectId: z.string().min(1, "Proyek wajib dipilih") })
  .refine(hasValidDueDate, dueDateIssue)
  .refine(hasValidTotal, totalIssue);

// Proyek tidak bisa diganti saat mengubah invoice, agar invoice tetap milik klien yang sama.
export const invoiceUpdateSchema = invoiceFields.refine(hasValidDueDate, dueDateIssue).refine(hasValidTotal, totalIssue);

export type InvoiceInput = z.input<typeof invoiceSchema>;
export type InvoiceValues = z.output<typeof invoiceSchema>;
