"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { PiWarningCircle } from "react-icons/pi";
import { login } from "@/app/(auth)/actions";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authText } from "@/lib/labels";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await login(values);
      if (result?.error) setFormError(result.error);
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      {formError && (
        <p role="alert" className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-danger">
          <PiWarningCircle className="size-5 shrink-0" />
          {formError}
        </p>
      )}
      <FormField label={authText.email} htmlFor="email" error={errors.email?.message} required>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nama@perusahaan.co.id"
          className="h-11"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>
      <FormField label={authText.password} htmlFor="password" error={errors.password?.message} required>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="h-11"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? authText.submitting : authText.submit}
      </Button>
    </form>
  );
}
