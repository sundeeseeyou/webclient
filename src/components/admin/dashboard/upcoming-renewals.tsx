import { cn } from "cn";
import Link from "next/link";
import { PiCalendarCheck } from "react-icons/pi";
import { DashboardListCard } from "@/components/admin/dashboard/dashboard-list-card";
import { EmptyState } from "@/components/shared/empty-state";
import { RENEWAL_LIST_DAYS, type RenewalKind, type UpcomingRenewal } from "@/lib/admin-dashboard";
import { formatDate } from "@/lib/format";
import { renewalStatus, type RenewalTone } from "@/lib/renewal";

const kindLabels: Record<RenewalKind, string> = { domain: "Domain", hosting: "Hosting" };

// Warna sisa hari sama dengan kartu website: kuning <= 30 hari, merah <= 7 hari atau sudah lewat.
const toneClasses: Record<RenewalTone, string> = {
  neutral: "text-muted-foreground",
  warning: "font-medium text-warning",
  danger: "font-medium text-danger",
};

type UpcomingRenewalsProps = {
  renewals: UpcomingRenewal[];
  now: Date;
};

export function UpcomingRenewals({ renewals, now }: UpcomingRenewalsProps) {
  return (
    <DashboardListCard
      id="perpanjangan"
      className="scroll-mt-20"
      title="Perpanjangan terdekat"
      description={`Domain dan hosting yang habis dalam ${RENEWAL_LIST_DAYS} hari ke depan atau sudah lewat.`}
    >
      {renewals.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={PiCalendarCheck}
            title="Belum ada yang perlu diperpanjang"
            description={`Tidak ada domain atau hosting yang habis dalam ${RENEWAL_LIST_DAYS} hari ke depan.`}
          />
        </div>
      ) : (
        <ul className="divide-y">
          {renewals.map((renewal) => {
            const status = renewalStatus(renewal.date, now);
            return (
              <li key={`${renewal.websiteId}-${renewal.kind}`}>
                <Link
                  href={`/admin/websites/${renewal.websiteId}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="font-medium break-all">{renewal.domain}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {kindLabels[renewal.kind]} · {formatDate(renewal.date)}
                    </p>
                  </div>
                  <span className={cn("shrink-0 text-right text-xs", toneClasses[status.tone])}>{status.text}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardListCard>
  );
}
