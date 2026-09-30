import { z } from "zod";

// Pesan bawaan Zod dalam Bahasa Indonesia untuk kasus yang tidak diberi pesan khusus.
z.config(z.locales.id());

/*
 * Aturan skema: hasil parse harus tetap valid bila di-parse ulang (idempoten), karena form
 * memvalidasi di browser lalu mengirim hasilnya sebagai JSON ke API yang memvalidasi lagi.
 * Karena itu tanggal tetap berupa string "YYYY-MM-DD" dan diubah ke Date di route handler.
 */

export function requiredText(label: string, max = 200) {
  return z.string().trim().min(1, `${label} wajib diisi`).max(max, `${label} maksimal ${max} karakter`);
}

export function optionalText(label: string, max = 500) {
  return z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .nullish()
    .transform((value) => value || null);
}

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email wajib diisi")
  .pipe(z.email("Format email tidak valid"));

export function passwordField(min = 8) {
  return z.string().min(min, `Password minimal ${min} karakter`).max(100, "Password maksimal 100 karakter");
}

export const optionalUrl = z
  .union([z.literal(""), z.url({ message: "Alamat tautan tidak valid, contoh: https://drive.google.com/..." })])
  .nullish()
  .transform((value) => value || null);

export function dateField(label: string) {
  return z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} wajib diisi`);
}

export function optionalDateField(label: string) {
  return z
    .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} tidak valid`)])
    .nullish()
    .transform((value) => value || null);
}

export function monthField(label: string) {
  return z.string().regex(/^\d{4}-\d{2}$/, `${label} wajib diisi`);
}

export function wholeNumber(label: string) {
  return z.coerce
    .number({ message: `${label} harus berupa angka` })
    .int(`${label} harus bilangan bulat`)
    .min(0, `${label} tidak boleh negatif`);
}

export const idField = z.string().min(1, "Pilihan wajib diisi");
