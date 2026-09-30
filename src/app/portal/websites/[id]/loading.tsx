import { Skeleton } from "@/components/ui/skeleton";

export default function PortalWebsiteLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat data website">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-3 h-7 w-56" />
      <Skeleton className="mt-2 h-4 w-24" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Skeleton className="h-96 rounded-xl xl:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
