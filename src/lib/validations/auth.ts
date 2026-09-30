import { z } from "zod";
import { authText } from "@/lib/labels";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, authText.emailRequired).pipe(z.email(authText.emailInvalid)),
  password: z.string().min(1, authText.passwordRequired),
});

export type LoginInput = z.infer<typeof loginSchema>;
