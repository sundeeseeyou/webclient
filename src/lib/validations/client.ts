import { z } from "zod";
import { emailField, optionalText, passwordField, requiredText } from "@/lib/validations/common";

export const EMAIL_TAKEN_MESSAGE = "Email sudah dipakai akun lain";

const phoneField = optionalText("Nomor telepon", 30).refine(
  (value) => value === null || /^\+?[0-9\s-]{6,}$/.test(value),
  "Nomor telepon hanya boleh berisi angka, spasi, tanda + atau -",
);

export const clientProfileSchema = z.object({
  company: requiredText("Nama perusahaan", 150),
  name: requiredText("Nama PIC", 100),
  email: emailField,
  phone: phoneField,
  address: optionalText("Alamat", 500),
  notes: optionalText("Catatan", 1000),
});

export const clientAccountSchema = z.object({
  name: requiredText("Nama akun", 100),
  email: emailField,
  password: passwordField(),
});

// Akun login boleh tidak dibuat saat klien didaftarkan (null), lalu ditambahkan dari halaman detail.
export const createClientSchema = clientProfileSchema.extend({
  account: clientAccountSchema.nullable(),
});

export const updateClientSchema = clientProfileSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Skema khusus form "Tambah Klien": bagian akun hanya divalidasi saat "Buatkan akun login" dicentang.
export const newClientFormSchema = clientProfileSchema
  .extend({
    withAccount: z.boolean(),
    account: z.object({ name: z.string(), email: z.string(), password: z.string() }),
  })
  .superRefine((values, ctx) => {
    if (!values.withAccount) return;
    const result = clientAccountSchema.safeParse(values.account);
    if (result.success) return;
    for (const issue of result.error.issues) {
      ctx.addIssue({ code: "custom", message: issue.message, path: ["account", ...issue.path] });
    }
  });

export type ClientProfileInput = z.input<typeof clientProfileSchema>;
export type ClientAccountInput = z.input<typeof clientAccountSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type NewClientFormInput = z.input<typeof newClientFormSchema>;
