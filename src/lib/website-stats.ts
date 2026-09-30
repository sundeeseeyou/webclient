import { startOfMonthWib, toMonthInputValue } from "@/lib/dates";

export const CHART_MONTHS = 6;

type StatRow = { period: Date; visitors: number; pageviews: number };

export type MonthlyPoint = {
  month: string;
  label: string;
  visitors: number | null;
  pageviews: number | null;
};

const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const numberFormatter = new Intl.NumberFormat("id-ID");

// "Sep 2026"
export function formatMonth(date: Date): string {
  return monthFormatter.format(date);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

// Awal rentang grafik: tanggal 1 bulan ke-6 terakhir (termasuk bulan berjalan), dalam WIB.
export function chartRangeStart(now: Date = new Date()): Date {
  return startOfMonthWib(now, -(CHART_MONTHS - 1));
}

// Bulan tanpa data tetap muncul di grafik dengan nilai null, supaya tidak tampil sebagai angka palsu.
export function monthlySeries(stats: StatRow[], now: Date = new Date(), months = CHART_MONTHS): MonthlyPoint[] {
  const byMonth = new Map(stats.map((stat) => [toMonthInputValue(stat.period), stat]));
  return Array.from({ length: months }, (_, index) => {
    const period = startOfMonthWib(now, index - (months - 1));
    const month = toMonthInputValue(period);
    const stat = byMonth.get(month);
    return { month, label: formatMonth(period), visitors: stat?.visitors ?? null, pageviews: stat?.pageviews ?? null };
  });
}

export type MonthComparison =
  | { kind: "no-data" }
  | { kind: "no-previous" }
  | { kind: "change"; percent: number };

// Perbandingan bulan ini dengan bulan lalu, hanya dari data yang benar-benar ada.
export function compareWithPreviousMonth(current: number | null, previous: number | null): MonthComparison {
  if (current === null) return { kind: "no-data" };
  if (previous === null || previous === 0) return { kind: "no-previous" };
  return { kind: "change", percent: Math.round(((current - previous) / previous) * 100) };
}
