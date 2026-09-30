import { ArticleStatus, Platform, WebsiteStatus } from "@prisma/client";
import { z } from "zod";
import { toMonthInputValue } from "@/lib/dates";
import { monthField, optionalDateField, optionalText, requiredText, wholeNumber } from "@/lib/validations/common";

const DOMAIN_PATTERN = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
const MAX_COUNT = 1_000_000_000;

// "https://Senyumsehat.co.id/" -> "senyumsehat.co.id", supaya domain yang sama tidak tersimpan dua kali dengan penulisan berbeda.
function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

const domainField = z
  .string()
  .transform(normalizeDomain)
  .pipe(
    z
      .string()
      .min(1, "Domain wajib diisi")
      .max(253, "Domain terlalu panjang")
      .regex(DOMAIN_PATTERN, "Format domain tidak valid, contoh: namadomain.co.id"),
  );

function optionalHttpUrl(message: string) {
  return z
    .union([z.literal(""), z.url({ protocol: /^https?$/, message })])
    .nullish()
    .transform((value) => (value ? value.replace(/\/+$/, "") : null));
}

const ga4PropertyField = z
  .string()
  .trim()
  .regex(/^\d*$/, "ID properti GA4 berupa angka, contoh: 412345678")
  .max(20, "ID properti GA4 maksimal 20 digit")
  .nullish()
  .transform((value) => value || null);

export const websiteSchema = z.object({
  clientId: z.string().min(1, "Klien wajib dipilih"),
  domain: domainField,
  platform: z.enum(Platform, { message: "Platform wajib dipilih" }),
  hostingProvider: optionalText("Penyedia hosting", 100),
  hostingRenewAt: optionalDateField("Tanggal perpanjangan hosting"),
  domainRenewAt: optionalDateField("Tanggal perpanjangan domain"),
  status: z.enum(WebsiteStatus, { message: "Status wajib dipilih" }),
  ga4PropertyId: ga4PropertyField,
  wpApiUrl: optionalHttpUrl("Alamat API WordPress tidak valid, contoh: https://namadomain.com/wp-json"),
});

export type WebsiteInput = z.input<typeof websiteSchema>;
export type WebsiteValues = z.output<typeof websiteSchema>;

// Isian kosong ditolak dulu, karena z.coerce mengubah "" menjadi 0 yang terlihat seperti data asli.
function countField(label: string) {
  return z
    .custom<unknown>((value) => (typeof value === "string" ? value.trim() !== "" : value != null), `${label} wajib diisi`)
    .pipe(wholeNumber(label).max(MAX_COUNT, `${label} terlalu besar`));
}

export const websiteStatSchema = z.object({
  month: monthField("Bulan")
    .refine((value) => {
      const month = Number(value.slice(5, 7));
      return month >= 1 && month <= 12;
    }, "Bulan tidak valid")
    // Statistik dicatat untuk bulan yang sudah berjalan, bukan perkiraan bulan depan.
    .refine((value) => value <= toMonthInputValue(new Date()), "Bulan tidak boleh melewati bulan ini"),
  visitors: countField("Jumlah pengunjung"),
  pageviews: countField("Jumlah tampilan halaman"),
});

export type WebsiteStatInput = z.input<typeof websiteStatSchema>;

export const articleSchema = z.object({
  title: requiredText("Judul artikel", 200),
  url: optionalHttpUrl("Alamat artikel tidak valid, contoh: https://namadomain.com/judul-artikel"),
  status: z.enum(ArticleStatus, { message: "Status wajib dipilih" }),
  publishedAt: optionalDateField("Tanggal terbit"),
});

export type ArticleInput = z.input<typeof articleSchema>;
