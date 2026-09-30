import type { DataSource } from "@prisma/client";
import { PiChartBar } from "react-icons/pi";
import { EmptyState } from "@/components/shared/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dataSourceLabels } from "@/lib/labels";
import { formatMonth, formatNumber } from "@/lib/website-stats";

type StatRow = {
  id: string;
  period: Date;
  visitors: number;
  pageviews: number;
  source: DataSource;
};

type WebsiteStatTableProps = {
  stats: StatRow[];
  showSource?: boolean;
  emptyDescription: string;
};

export function WebsiteStatTable({ stats, showSource = false, emptyDescription }: WebsiteStatTableProps) {
  if (stats.length === 0) {
    return <EmptyState icon={PiChartBar} title="Belum ada data statistik" description={emptyDescription} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bulan</TableHead>
          <TableHead className="text-right">Pengunjung</TableHead>
          <TableHead className="text-right">Tampilan halaman</TableHead>
          {showSource && <TableHead>Sumber</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.map((stat) => (
          <TableRow key={stat.id}>
            <TableCell>{formatMonth(stat.period)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatNumber(stat.visitors)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatNumber(stat.pageviews)}</TableCell>
            {showSource && <TableCell className="text-muted-foreground">{dataSourceLabels[stat.source]}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
