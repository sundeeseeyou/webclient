"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { PiFloppyDisk } from "react-icons/pi";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { uiText } from "@/lib/labels";
import { websiteStatSchema, type WebsiteStatInput } from "@/lib/validations/website";

type MonthValue = { month: string; visitors: number; pageviews: number };

type StatFormProps = {
  websiteId: string;
  currentMonth: string;
  stats: MonthValue[];
  className?: string;
};

export function StatForm({ websiteId, currentMonth, stats, className }: StatFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const valuesFor = (month: string) => stats.find((stat) => stat.month === month);
  const current = valuesFor(currentMonth);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<WebsiteStatInput>({
    resolver: zodResolver(websiteStatSchema),
    defaultValues: { month: currentMonth, visitors: current?.visitors ?? "", pageviews: current?.pageviews ?? "" },
  });

  // Bulan yang sudah punya data langsung terisi, supaya admin tahu sedang menimpa angka lama.
  const fillMonth = (month: string) => {
    const existing = valuesFor(month);
    setValue("visitors", existing?.visitors ?? "");
    setValue("pageviews", existing?.pageviews ?? "");
  };

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const result = await apiRequest(`/api/websites/${websiteId}/stats`, { method: "PUT", body: values });
      if (result.error) {
        setFieldErrors(setError, result.error.fields);
        toast.error(result.error.message);
        return;
      }
      toast.success("Statistik bulanan berhasil disimpan.");
      router.refresh();
    }),
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Input statistik bulanan</CardTitle>
        <CardDescription>Mengisi bulan yang sudah ada akan memperbarui angkanya.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField label="Bulan" htmlFor="month" error={errors.month?.message} required>
            <Input
              id="month"
              type="month"
              max={currentMonth}
              aria-invalid={Boolean(errors.month)}
              {...register("month", { onChange: (event) => fillMonth(event.target.value) })}
            />
          </FormField>
          <FormField label="Pengunjung" htmlFor="visitors" error={errors.visitors?.message} required>
            <Input
              id="visitors"
              type="number"
              min={0}
              inputMode="numeric"
              aria-invalid={Boolean(errors.visitors)}
              {...register("visitors")}
            />
          </FormField>
          <FormField label="Tampilan halaman" htmlFor="pageviews" error={errors.pageviews?.message} required>
            <Input
              id="pageviews"
              type="number"
              min={0}
              inputMode="numeric"
              aria-invalid={Boolean(errors.pageviews)}
              {...register("pageviews")}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={isPending}>
            <PiFloppyDisk />
            {isPending ? uiText.saving : "Simpan statistik"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
