import { PiFileText } from "react-icons/pi";
import { ReportContents } from "@/components/portal/report-contents";
import { EmptyState } from "@/components/shared/empty-state";
import { MonthlyReportForm } from "@/components/shared/monthly-report-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { navLabels } from "@/lib/labels";
import { defaultReportMonth, reportMonthOptions } from "@/lib/monthly-report";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/rbac";

export default async function PortalReportsPage() {
  const user = await requireClient();
  const now = new Date();
  // Hanya website milik klien yang login (clientId dari session).
  const websites = await prisma.website.findMany({
    where: { clientId: user.clientId },
    orderBy: { createdAt: "asc" },
    select: { id: true, domain: true },
  });

  return (
    <>
      <PageHeader title={navLabels.reports} description="Unduh ringkasan bulanan website Anda dalam bentuk PDF." />
      {websites.length === 0 ? (
        <EmptyState
          icon={PiFileText}
          title="Belum ada website"
          description="Laporan bulanan bisa diunduh setelah website Anda didaftarkan oleh tim Boowat."
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Unduh laporan bulanan</CardTitle>
              <CardDescription>Pilih website dan bulan, lalu laporan PDF akan terunduh otomatis.</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyReportForm websites={websites} months={reportMonthOptions(now)} defaultMonth={defaultReportMonth(now)} />
            </CardContent>
          </Card>
          <ReportContents className="lg:col-span-2" />
        </div>
      )}
    </>
  );
}
