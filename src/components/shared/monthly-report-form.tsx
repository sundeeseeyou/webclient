"use client";

import { useState } from "react";
import { PiDownloadSimple } from "react-icons/pi";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ApiError } from "@/lib/api";
import type { MonthOption } from "@/lib/monthly-report";

// Diunduh lewat fetch (bukan tautan biasa) agar pesan error dari API tampil sebagai toast, bukan halaman JSON.
async function downloadPdf(url: string): Promise<string | null> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    return "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.";
  }

  if (!response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const error = isJson ? ((await response.json()) as { error: ApiError | null }).error : null;
    const fieldMessage = error?.fields ? Object.values(error.fields)[0] : undefined;
    return fieldMessage ?? error?.message ?? "Gagal membuat laporan. Coba lagi beberapa saat.";
  }

  const filename = /filename="([^"]+)"/.exec(response.headers.get("content-disposition") ?? "")?.[1] ?? "Laporan.pdf";
  const blobUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  return null;
}

type MonthlyReportFormProps = {
  websites: { id: string; domain: string }[];
  months: MonthOption[];
  defaultMonth: string;
  // Di detail website admin, websitenya sudah pasti sehingga pilihan website disembunyikan.
  showWebsiteSelect?: boolean;
  onDownloaded?: () => void;
};

export function MonthlyReportForm({
  websites,
  months,
  defaultMonth,
  showWebsiteSelect = true,
  onDownloaded,
}: MonthlyReportFormProps) {
  const [websiteId, setWebsiteId] = useState(websites[0]?.id ?? "");
  const [month, setMonth] = useState(defaultMonth);
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const error = await downloadPdf(`/api/reports/monthly?${new URLSearchParams({ websiteId, month })}`);
    setIsPending(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Laporan bulanan berhasil diunduh.");
    onDownloaded?.();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {showWebsiteSelect && (
        <FormField label="Website" htmlFor="report-website" required>
          <Select value={websiteId} onValueChange={setWebsiteId}>
            <SelectTrigger id="report-website" className="w-full">
              <SelectValue placeholder="Pilih website" />
            </SelectTrigger>
            <SelectContent>
              {websites.map((website) => (
                <SelectItem key={website.id} value={website.id}>
                  {website.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
      <FormField
        label="Bulan"
        htmlFor="report-month"
        hint="Laporan bulan berjalan belum lengkap sampai akhir bulan."
        required
      >
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger id="report-month" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <Button type="submit" className="w-full sm:w-auto" disabled={isPending || !websiteId}>
        <PiDownloadSimple />
        {isPending ? "Menyiapkan laporan..." : "Unduh Laporan Bulanan"}
      </Button>
    </form>
  );
}
