import { ProjectStatus, ProjectType, SprintStatus, TaskStatus } from "@prisma/client";
import { z } from "zod";
import { dateField, optionalDateField, optionalText, requiredText } from "@/lib/validations/common";

export const MESSAGE_MAX_LENGTH = 2000;

export const END_DATE_ERROR = "Tanggal selesai tidak boleh sebelum tanggal mulai";

// Tanggal berformat "YYYY-MM-DD" sehingga urutannya bisa dibandingkan langsung sebagai teks.
export function isDateRangeValid(start?: string | null, end?: string | null): boolean {
  return !start || !end || end >= start;
}

type DateRange = { startDate?: string | null; endDate?: string | null };

const hasValidDateRange = (value: DateRange) => isDateRangeValid(value.startDate, value.endDate);
const dateRangeIssue = { message: END_DATE_ERROR, path: ["endDate"] };

const projectFields = z.object({
  name: requiredText("Nama proyek", 150),
  description: optionalText("Deskripsi", 2000),
  type: z.enum(ProjectType, { message: "Jenis proyek wajib dipilih" }),
  websiteId: z
    .string()
    .nullish()
    .transform((value) => value || null),
  startDate: dateField("Tanggal mulai"),
  endDate: optionalDateField("Tanggal selesai"),
});

export const projectSchema = projectFields
  .extend({ clientId: z.string().min(1, "Klien wajib dipilih") })
  .refine(hasValidDateRange, dateRangeIssue);

// Klien pemilik proyek tidak bisa diganti lewat PATCH agar pesan dan invoice tetap milik klien yang sama.
export const projectUpdateSchema = projectFields
  .extend({ status: z.enum(ProjectStatus, { message: "Status proyek tidak valid" }) })
  .partial()
  .refine(hasValidDateRange, dateRangeIssue);

const sprintFields = z.object({
  name: requiredText("Nama sprint", 100),
  goal: optionalText("Tujuan sprint", 500),
  startDate: dateField("Tanggal mulai"),
  endDate: dateField("Tanggal selesai"),
  status: z.enum(SprintStatus, { message: "Status sprint wajib dipilih" }),
});

export const sprintSchema = sprintFields.refine(hasValidDateRange, dateRangeIssue);
export const sprintUpdateSchema = sprintFields.partial().refine(hasValidDateRange, dateRangeIssue);

const taskFields = z.object({
  title: requiredText("Judul task", 200),
  description: optionalText("Deskripsi", 1000),
  assignee: optionalText("Penanggung jawab", 100),
});

export const taskSchema = taskFields;
export const taskUpdateSchema = taskFields
  .extend({
    status: z.enum(TaskStatus, { message: "Status task tidak valid" }),
    order: z.number().int().min(0, "Urutan tidak valid"),
  })
  .partial();

export const messageSchema = z.object({
  body: requiredText("Pesan", MESSAGE_MAX_LENGTH),
});

export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectValues = z.output<typeof projectSchema>;
