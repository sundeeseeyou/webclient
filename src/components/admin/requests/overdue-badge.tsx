import { StatusBadge } from "@/components/shared/status-badge";

// Terlambat = belum direspons admin dan batas waktu respon sudah lewat (lib/sla.ts).
export function OverdueBadge() {
  return <StatusBadge tone="danger">Melewati SLA</StatusBadge>;
}
