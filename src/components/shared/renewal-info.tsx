import { cn } from "cn";
import { formatDate } from "@/lib/format";
import { renewalStatus, type RenewalTone } from "@/lib/renewal";

const boxClasses: Record<RenewalTone, string> = {
  neutral: "bg-card",
  warning: "border-warning/40 bg-warning/5",
  danger: "border-danger/40 bg-danger/5",
};

const textClasses: Record<RenewalTone, string> = {
  neutral: "text-muted-foreground",
  warning: "font-medium text-warning",
  danger: "font-medium text-danger",
};

type RenewalInfoProps = {
  label: string;
  date: Date | null;
  detail?: string | null;
  now: Date;
};

// Masa aktif domain/hosting: kuning bila tinggal <= 30 hari, merah bila <= 7 hari atau sudah lewat.
export function RenewalInfo({ label, date, detail, now }: RenewalInfoProps) {
  const status = date ? renewalStatus(date, now) : null;
  return (
    <div className={cn("rounded-lg border px-4 py-3", boxClasses[status?.tone ?? "neutral"])}>
      <p className="text-xs text-muted-foreground">
        {label}
        {detail && <span> · {detail}</span>}
      </p>
      <p className="mt-1 font-medium">{date ? formatDate(date) : "Belum diisi"}</p>
      {status && <p className={cn("mt-0.5 text-xs", textClasses[status.tone])}>{status.text}</p>}
    </div>
  );
}
