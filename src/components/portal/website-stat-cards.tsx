import { PiArticle, PiCursorClick, PiUsers, PiUsersThree } from "react-icons/pi";
import { MonthChange } from "@/components/portal/month-change";
import { StatCard } from "@/components/shared/stat-card";
import { compareWithPreviousMonth, formatNumber, type MonthlyPoint } from "@/lib/website-stats";

type WebsiteStatCardsProps = {
  series: MonthlyPoint[];
  publishedArticles: number;
};

export function WebsiteStatCards({ series, publishedArticles }: WebsiteStatCardsProps) {
  const [previous, current] = series.slice(-2);
  const recorded = series.flatMap((point) => (point.visitors === null ? [] : [point.visitors]));
  const total = recorded.length > 0 ? recorded.reduce((sum, value) => sum + value, 0) : null;
  const format = (value: number | null) => (value === null ? null : formatNumber(value));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={PiUsers} label="Pengunjung bulan ini" value={format(current.visitors)}>
        <MonthChange comparison={compareWithPreviousMonth(current.visitors, previous.visitors)} />
      </StatCard>
      <StatCard icon={PiCursorClick} label="Tampilan halaman bulan ini" value={format(current.pageviews)}>
        <MonthChange comparison={compareWithPreviousMonth(current.pageviews, previous.pageviews)} />
      </StatCard>
      <StatCard icon={PiUsersThree} label="Total pengunjung 6 bulan terakhir" value={format(total)}>
        {total !== null && recorded.length < series.length && (
          <span className="text-muted-foreground">Dari {recorded.length} bulan yang sudah ada datanya</span>
        )}
      </StatCard>
      <StatCard icon={PiArticle} label="Artikel terbit" value={formatNumber(publishedArticles)} />
    </div>
  );
}
