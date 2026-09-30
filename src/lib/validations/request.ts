import { RequestPriority, RequestStatus, RequestType } from "@prisma/client";
import { z } from "zod";
import { optionalText, optionalUrl, requiredText } from "@/lib/validations/common";

export const REJECTION_REASON_MIN = 10;

const optionalId = z
  .string()
  .nullish()
  .transform((value) => value || null);

const requestType = z.enum(RequestType, { message: "Jenis permintaan wajib dipilih" });

export const requestSchema = z.object({
  websiteId: optionalId,
  projectId: optionalId,
  type: requestType,
  priority: z.enum(RequestPriority, { message: "Prioritas wajib dipilih" }),
  title: requiredText("Judul permintaan", 150),
  description: requiredText("Deskripsi", 3000),
  referenceUrl: optionalUrl,
});

export const WEBSITE_REQUIRED = "Website wajib dipilih";

// Klien yang punya website wajib memilih website yang dimaksud; klien tanpa website tetap bisa mengajukan.
export const requestWithWebsiteSchema = requestSchema.refine((values) => Boolean(values.websiteId), {
  message: WEBSITE_REQUIRED,
  path: ["websiteId"],
});

// Website dan proyek diambil dari proyek yang direvisi, bukan dari isian klien.
export const revisionSchema = requestSchema
  .omit({ websiteId: true, projectId: true })
  .extend({ type: requestType.default("DESIGN_REVISION") });

const rejectionReasonField = z
  .string()
  .trim()
  .min(1, "Alasan penolakan wajib diisi")
  .min(REJECTION_REASON_MIN, `Alasan penolakan minimal ${REJECTION_REASON_MIN} karakter`)
  .max(1000, "Alasan penolakan maksimal 1000 karakter");

const adminResponseField = optionalText("Tanggapan", 2000);

export const requestStatusSchema = z
  .object({
    status: z.enum(RequestStatus, { message: "Status permintaan tidak valid" }),
    adminResponse: adminResponseField,
    rejectionReason: optionalText("Alasan penolakan", 1000),
  })
  .superRefine((value, ctx) => {
    if (value.status !== "REJECTED") return;
    // Penolakan tanpa alasan tidak boleh tersimpan karena klien perlu tahu kenapa permintaannya ditolak (BB-13).
    const reason = rejectionReasonField.safeParse(value.rejectionReason ?? "");
    if (!reason.success) {
      ctx.addIssue({ code: "custom", path: ["rejectionReason"], message: reason.error.issues[0].message });
    }
  });

export const rejectionSchema = z.object({ rejectionReason: rejectionReasonField });
export const responseSchema = z.object({ adminResponse: adminResponseField });

export type RequestInput = z.input<typeof requestSchema>;
export type RequestValues = z.output<typeof requestSchema>;
