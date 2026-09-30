import { Skeleton } from "@/components/ui/skeleton";

// Berada di route group (dashboard) agar skeleton beranda tidak ikut tampil saat membuka halaman admin lain.
export default function AdminDashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat beranda">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-xl border bg-card p-5 shadow-xs">
            <Skeleton className="size-11 rounded-lg" />
            <Skeleton className="mt-4 h-3 w-32" />
            <Skeleton className="mt-2 h-6 w-16" />
            <Skeleton className="mt-2 h-3 w-40" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {[0, 1].map((card) => (
          <div key={card} className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <div className="space-y-2 border-b px-5 py-4">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            {Array.from({ length: 5 }, (_, row) => (
              <div key={row} className="flex items-center justify-between gap-4 border-b px-5 py-3.5 last:border-0">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
