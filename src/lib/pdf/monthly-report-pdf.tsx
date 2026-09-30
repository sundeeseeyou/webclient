import { Document, Page, Text } from "@react-pdf/renderer";
import { formatDate, formatDateTime } from "@/lib/format";
import { projectStatusLabels, requestTypeLabels } from "@/lib/labels";
import type { MonthlyReport } from "@/lib/monthly-report";
import { PdfFooter, PdfHeader } from "@/lib/pdf/layout";
import { PdfEmpty, PdfInfoGrid, PdfSection, PdfTable, type PdfCell } from "@/lib/pdf/report-parts";
import { pdfColors, pdfStyles } from "@/lib/pdf/theme";
import { renewalStatus, type RenewalTone } from "@/lib/renewal";
import { compareWithPreviousMonth, formatNumber } from "@/lib/website-stats";

// Sama dengan warna masa aktif di aplikasi: kuning <= 30 hari, merah <= 7 hari atau sudah lewat.
const renewalColors: Record<RenewalTone, string> = {
  neutral: pdfColors.muted,
  warning: "#9a6a00",
  danger: pdfColors.danger,
};

// Bulan tanpa data ditulis "Belum ada data", bukan 0, agar tidak terbaca sebagai angka asli.
function countCell(value: number | null): PdfCell {
  return value === null ? { text: "Belum ada data", color: pdfColors.muted } : formatNumber(value);
}

function changeCell(current: number | null, previous: number | null): PdfCell {
  const comparison = compareWithPreviousMonth(current, previous);
  if (comparison.kind === "no-data") return { text: "-", color: pdfColors.muted };
  if (comparison.kind === "no-previous") return { text: "Belum bisa dibandingkan", color: pdfColors.muted };
  const { percent } = comparison;
  if (percent > 0) return { text: `Naik ${percent}%`, color: pdfColors.success };
  if (percent < 0) return { text: `Turun ${Math.abs(percent)}%`, color: pdfColors.danger };
  return { text: "Tetap", color: pdfColors.muted };
}

function renewalRow(label: string, date: Date | null, generatedAt: Date): PdfCell[] {
  if (!date) return [label, "Belum diisi", "-"];
  const status = renewalStatus(date, generatedAt);
  return [label, formatDate(date), { text: status.text, color: renewalColors[status.tone] }];
}

type MonthlyReportDocumentProps = {
  report: MonthlyReport;
  generatedAt: Date;
};

export function MonthlyReportDocument({ report, generatedAt }: MonthlyReportDocumentProps) {
  const { website, traffic } = report;
  const current = traffic.current;
  const previous = traffic.previous;

  return (
    <Document title={`Laporan Bulanan ${website.domain} - ${report.periodLabel}`} author="Boowat" language="id">
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Laporan Bulanan" subtitle={report.periodLabel} />
        <PdfInfoGrid
          items={[
            { label: "Klien", value: report.company },
            { label: "Website", value: website.domain },
            { label: "Periode", value: report.periodLabel },
            { label: "Dibuat pada", value: formatDateTime(generatedAt) },
          ]}
        />

        <PdfSection title="Pengunjung dan tampilan halaman" note={`Dibandingkan dengan ${report.previousLabel}.`}>
          <PdfTable
            columns={[
              { label: "Data", width: "28%" },
              { label: report.previousLabel, width: "22%", align: "right" },
              { label: report.periodLabel, width: "22%", align: "right" },
              { label: "Perubahan", width: "28%", align: "right" },
            ]}
            rows={[
              [
                "Pengunjung",
                countCell(previous?.visitors ?? null),
                countCell(current?.visitors ?? null),
                changeCell(current?.visitors ?? null, previous?.visitors ?? null),
              ],
              [
                "Tampilan halaman",
                countCell(previous?.pageviews ?? null),
                countCell(current?.pageviews ?? null),
                changeCell(current?.pageviews ?? null, previous?.pageviews ?? null),
              ],
            ]}
          />
        </PdfSection>

        <PdfSection title={`Artikel terbit (${report.articles.length})`}>
          {report.articles.length === 0 ? (
            <PdfEmpty>{`Tidak ada artikel yang terbit pada ${report.periodLabel}.`}</PdfEmpty>
          ) : (
            <PdfTable
              columns={[
                { label: "No", width: "8%" },
                { label: "Judul artikel", width: "70%" },
                { label: "Tanggal terbit", width: "22%", align: "right" },
              ]}
              rows={report.articles.map((article, index) => [
                String(index + 1),
                article.title,
                article.publishedAt ? formatDate(article.publishedAt) : "-",
              ])}
            />
          )}
        </PdfSection>

        <PdfSection title={`Permintaan yang diselesaikan (${report.requests.length})`}>
          {report.requests.length === 0 ? (
            <PdfEmpty>{`Tidak ada permintaan yang diselesaikan pada ${report.periodLabel}.`}</PdfEmpty>
          ) : (
            <PdfTable
              columns={[
                { label: "Permintaan", width: "48%" },
                { label: "Jenis", width: "30%" },
                { label: "Tanggal selesai", width: "22%", align: "right" },
              ]}
              rows={report.requests.map((request) => [
                request.title,
                requestTypeLabels[request.type],
                request.resolvedAt ? formatDate(request.resolvedAt) : "-",
              ])}
            />
          )}
        </PdfSection>

        <PdfSection title="Proyek yang sedang berjalan" note={`Status per ${formatDate(generatedAt)}.`}>
          {report.projects.length === 0 ? (
            <PdfEmpty>Tidak ada proyek yang sedang berjalan untuk website ini.</PdfEmpty>
          ) : (
            <PdfTable
              columns={[
                { label: "Proyek", width: "52%" },
                { label: "Status", width: "30%" },
                { label: "Progres", width: "18%", align: "right" },
              ]}
              rows={report.projects.map((project) => [
                project.name,
                projectStatusLabels[project.status],
                `${project.progress}%`,
              ])}
            />
          )}
        </PdfSection>

        <PdfSection title="Masa aktif domain dan hosting">
          <PdfTable
            columns={[
              { label: "Layanan", width: "40%" },
              { label: "Aktif sampai", width: "28%" },
              { label: "Keterangan", width: "32%", align: "right" },
            ]}
            rows={[
              renewalRow("Domain", website.domainRenewAt, generatedAt),
              renewalRow(
                website.hostingProvider ? `Hosting (${website.hostingProvider})` : "Hosting",
                website.hostingRenewAt,
                generatedAt,
              ),
            ]}
          />
        </PdfSection>

        <Text style={{ ...pdfStyles.muted, fontSize: 8, marginTop: 18 }}>
          Laporan ini dibuat otomatis dari data yang dicatat tim Boowat. Hubungi tim Boowat bila ada data yang perlu diperbaiki.
        </Text>
        <PdfFooter />
      </Page>
    </Document>
  );
}
