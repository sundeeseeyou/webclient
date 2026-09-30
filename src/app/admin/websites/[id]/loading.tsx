import { Skeleton } from "@/components/ui/skeleton";

export default function AdminWebsiteLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat data website">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="mt-3 h-7 w-64" />
      <Skeleton className="mt-2 h-4 w-40" />
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl xl:col-span-2" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl xl:col-span-2" />
      </div>
      <Skeleton className="mt-6 h-72 rounded-xl" />
    </div>
  );
}
