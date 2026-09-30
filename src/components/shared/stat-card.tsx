import { cn } from "cn";
import type { IconType } from "react-icons";

type StatCardProps = {
  icon: IconType;
  label: string;
  // null berarti data belum ada; ditampilkan sebagai teks, bukan angka nol.
  value: string | null;
  children?: React.ReactNode;
  className?: string;
};

export function StatCard({ icon: Icon, label, value, children, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-xs", className)}>
      <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 text-xs text-muted-foreground">{label}</p>
      {value === null ? (
        <p className="mt-1 text-base font-medium text-muted-foreground">Belum ada data</p>
      ) : (
        <p className="mt-1 text-xl font-semibold">{value}</p>
      )}
      {children && <div className="mt-1 text-xs">{children}</div>}
    </div>
  );
}
