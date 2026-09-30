import { cn } from "cn";
import Link from "next/link";
import type { IconType } from "react-icons";
import { PiCalendarX, PiClockCountdown, PiInvoice, PiKanban, PiTray, PiUsers } from "react-icons/pi";
import { StatCard } from "@/components/shared/stat-card";
import type { AdminSummary } from "@/lib/admin-dashboard";
import { formatRupiah } from "@/lib/format";
import { formatNumber } from "@/lib/website-stats";

type SummaryItem = {
  href: string;
  icon: IconType;
  label: string;
  value: number;
  note: string;
  danger?: boolean;
};

export function SummaryCards({ summary }: { summary: AdminSummary }) {
  // Tautan tiap kartu memakai filter yang sama dengan halaman tujuannya, agar angka di kartu dan daftar sama.
  const items: SummaryItem[] = [
    { href: "/admin/clients", icon: PiUsers, label: "Klien aktif", value: summary.activeClients, note: "Lihat daftar klien" },
    {
      href: "/admin/projects",
      icon: PiKanban,
      label: "Proyek berjalan",
      value: summary.runningProjects,
      note: "Belum selesai dan tidak ditunda",
    },
    {
      href: "/admin/requests?status=SUBMITTED",
      icon: PiTray,
      label: "Permintaan baru",
      value: summary.newRequests,
      note: "Belum ditinjau",
    },
    {
      href: "/admin/requests?overdue=1",
      icon: PiClockCountdown,
      label: "Permintaan melewati SLA",
      value: summary.overdueRequests,
      note: "Belum direspons melewati batas waktu",
      danger: summary.overdueRequests > 0,
    },
    {
      href: "/admin/invoices?status=unpaid",
      icon: PiInvoice,
      label: "Invoice belum lunas",
      value: summary.unpaidInvoices.count,
      note: `Total ${formatRupiah(summary.unpaidInvoices.total)}`,
    },
    {
      href: "#perpanjangan",
      icon: PiCalendarX,
      label: "Domain/hosting habis ≤ 30 hari",
      value: summary.expiringWebsites,
      note: "Jumlah website, termasuk yang sudah lewat",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <StatCard
            icon={item.icon}
            label={item.label}
            value={formatNumber(item.value)}
            className={cn(
              "h-full transition-colors group-hover:border-primary/40",
              item.danger && "border-danger/50 bg-danger/5 text-danger group-hover:border-danger",
            )}
          >
            <span className={cn(item.danger ? "font-medium" : "text-muted-foreground")}>{item.note}</span>
          </StatCard>
        </Link>
      ))}
    </div>
  );
}
