import { z } from "zod";
import { authText } from "@/lib/labels";
import { emailField } from "@/lib/validations/common";

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, authText.passwordRequired),
});

export type LoginInput = z.infer<typeof loginSchema>;
