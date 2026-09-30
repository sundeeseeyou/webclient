"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { login } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{authText.email}</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
        {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{authText.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
      </div>
      {formError && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? authText.submitting : authText.submit}
      </Button>
    </form>
  );
}
