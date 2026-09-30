import { Skeleton } from "@/components/ui/skeleton";

// Berada di route group (list) agar hanya membungkus halaman daftar, sama seperti daftar proyek portal.
export default function PortalRequestsLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat daftar permintaan">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
