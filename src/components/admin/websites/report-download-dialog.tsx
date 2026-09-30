"use client";

import { useState } from "react";
import { PiFileText } from "react-icons/pi";
import { MonthlyReportForm } from "@/components/shared/monthly-report-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { MonthOption } from "@/lib/monthly-report";

type ReportDownloadDialogProps = {
  website: { id: string; domain: string };
  months: MonthOption[];
  defaultMonth: string;
};

export function ReportDownloadDialog({ website, months, defaultMonth }: ReportDownloadDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PiFileText />
          Unduh Laporan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unduh laporan bulanan</DialogTitle>
          <DialogDescription className="wrap-break-word">
            Laporan PDF {website.domain}: pengunjung, artikel terbit, permintaan selesai, proyek berjalan, dan masa aktif.
          </DialogDescription>
        </DialogHeader>
        <MonthlyReportForm
          websites={[website]}
          months={months}
          defaultMonth={defaultMonth}
          showWebsiteSelect={false}
          onDownloaded={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
