import { z } from "zod";
import { toMonthInputValue } from "@/lib/dates";

export const monthlyReportQuerySchema = z.object({
  websiteId: z.string().trim().min(1, "Website wajib dipilih"),
  month: z
    .string()
    .trim()
    .min(1, "Bulan wajib dipilih")
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format bulan tidak valid, contoh: 2026-09")
    // Laporan hanya untuk bulan yang sudah berjalan; bulan depan belum punya data.
    .refine((value) => value <= toMonthInputValue(new Date()), "Bulan tidak boleh melewati bulan ini"),
});
