import type { MonthComparison } from "@/lib/website-stats";

// Perbandingan dengan bulan lalu dalam kalimat sederhana; tanpa data pembanding tidak ada persentase.
export function MonthChange({ comparison }: { comparison: MonthComparison }) {
  if (comparison.kind === "no-data") return null;
  if (comparison.kind === "no-previous") {
    return <span className="text-muted-foreground">Belum ada data bulan lalu untuk dibandingkan</span>;
  }

  const { percent } = comparison;
  if (percent > 0) return <span className="font-medium text-success">Naik {percent}% dari bulan lalu</span>;
  if (percent < 0) return <span className="font-medium text-danger">Turun {Math.abs(percent)}% dari bulan lalu</span>;
  return <span className="text-muted-foreground">Sama dengan bulan lalu</span>;
}
