"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ArticleStatus, DataSource } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { OptionSelect, toOptions } from "@/components/admin/websites/option-select";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/dates";
import { articleStatusLabels, uiText } from "@/lib/labels";
import { articleSchema, type ArticleInput } from "@/lib/validations/website";

export type ArticleItem = {
  id: string;
  title: string;
  url: string | null;
  status: ArticleStatus;
  publishedAt: Date | null;
  source: DataSource;
};

type ArticleDialogProps = {
  websiteId: string;
  article?: ArticleItem;
  trigger: React.ReactNode;
};

const statusOptions = toOptions(articleStatusLabels);

function ArticleForm({ websiteId, article, onDone }: { websiteId: string; article?: ArticleItem; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ArticleInput>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title ?? "",
      url: article?.url ?? "",
      status: article?.status ?? "PUBLISHED",
      publishedAt: article ? (article.publishedAt ? toDateInputValue(article.publishedAt) : "") : toDateInputValue(new Date()),
    },
  });

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const result = await apiRequest(article ? `/api/articles/${article.id}` : `/api/websites/${websiteId}/articles`, {
        method: article ? "PATCH" : "POST",
        body: values,
      });
      if (result.error) {
        setFieldErrors(setError, result.error.fields);
        toast.error(result.error.message);
        return;
      }
      toast.success(article ? "Artikel berhasil diperbarui." : "Artikel berhasil ditambahkan.");
      router.refresh();
      onDone();
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField label="Judul" htmlFor="title" error={errors.title?.message} required>
        <Input id="title" aria-invalid={Boolean(errors.title)} {...register("title")} />
      </FormField>
      <FormField label="Alamat artikel (URL)" htmlFor="url" error={errors.url?.message}>
        <Input id="url" type="url" placeholder="https://namadomain.com/judul-artikel" aria-invalid={Boolean(errors.url)} {...register("url")} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <OptionSelect
                id="status"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={statusOptions}
                placeholder="Pilih status"
                invalid={Boolean(errors.status)}
              />
            )}
          />
        </FormField>
        <FormField label="Tanggal terbit" htmlFor="publishedAt" error={errors.publishedAt?.message}>
          <Input id="publishedAt" type="date" aria-invalid={Boolean(errors.publishedAt)} {...register("publishedAt")} />
        </FormField>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
          {uiText.cancel}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? uiText.saving : uiText.save}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ArticleDialog({ websiteId, article, trigger }: ArticleDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{article ? "Ubah artikel" : "Tambah artikel"}</DialogTitle>
          <DialogDescription>Artikel berstatus Terbit akan terlihat oleh klien.</DialogDescription>
        </DialogHeader>
        <ArticleForm websiteId={websiteId} article={article} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
