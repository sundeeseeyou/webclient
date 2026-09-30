import { Skeleton } from "@/components/ui/skeleton";

export default function PortalLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat halaman">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {[0, 1].map((key) => (
          <div key={key} className="space-y-5 rounded-xl border bg-card p-5 shadow-xs">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-48" />
          </div>
        ))}
      </div>
    </div>
  );
}
