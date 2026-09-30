import { StatusBadge } from "@/components/shared/status-badge";

export function ClientStatusBadge({ isActive }: { isActive: boolean }) {
  return <StatusBadge tone={isActive ? "success" : "neutral"}>{isActive ? "Aktif" : "Nonaktif"}</StatusBadge>;
}
