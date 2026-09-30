"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type XAxisTickContentProps,
} from "recharts";
import type { MonthlyPoint } from "@/lib/website-stats";

const numberFormatter = new Intl.NumberFormat("id-ID");

type VisitorChartProps = {
  data: MonthlyPoint[];
  height?: number;
};

// Label bulan dipecah dua baris ("Sep" / "2026") agar enam bulan tetap muat di layar HP.
function MonthTick({ x, y, payload }: XAxisTickContentProps) {
  const [month, year] = String(payload.value).split(" ");
  return (
    <text x={x} y={y} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12}>
      <tspan x={x} dy={12}>
        {month}
      </tspan>
      <tspan x={x} dy={14}>
        {year}
      </tspan>
    </text>
  );
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  const point: MonthlyPoint | undefined = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="font-medium">{point.label}</p>
      {point.visitors === null ? (
        <p className="mt-1 text-muted-foreground">Belum ada data</p>
      ) : (
        <dl className="mt-1 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5">
          <dt className="text-muted-foreground">Pengunjung</dt>
          <dd className="text-right font-medium tabular-nums">{numberFormatter.format(point.visitors)}</dd>
          <dt className="text-muted-foreground">Tampilan halaman</dt>
          <dd className="text-right font-medium tabular-nums">{numberFormatter.format(point.pageviews ?? 0)}</dd>
        </dl>
      )}
    </div>
  );
}

export function VisitorChart({ data, height = 240 }: VisitorChartProps) {
  if (!data.some((point) => point.visitors !== null)) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed px-4 text-center text-muted-foreground"
        style={{ height }}
      >
        Belum ada data pengunjung
      </div>
    );
  }

  const hasGaps = data.some((point) => point.visitors === null);
  return (
    <figure>
      <BarChart responsive data={data} style={{ width: "100%", height }} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" interval={0} height={36} tickLine={false} axisLine={false} tick={MonthTick} />
        <YAxis
          width="auto"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={(value: number) => numberFormatter.format(value)}
        />
        <Tooltip cursor={{ fill: "var(--muted)" }} filterNull={false} content={ChartTooltip} />
        <Bar
          dataKey="visitors"
          name="Pengunjung"
          fill="var(--primary)"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
          isAnimationActive={false}
        />
      </BarChart>
      {hasGaps && <figcaption className="mt-2 text-xs text-muted-foreground">Bulan tanpa batang belum memiliki data.</figcaption>}
    </figure>
  );
}
