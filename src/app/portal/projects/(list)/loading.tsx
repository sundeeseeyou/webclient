import { Skeleton } from "@/components/ui/skeleton";

// Berada di route group (list) agar hanya membungkus halaman daftar. Halaman detail tidak ikut streaming,
// sehingga proyek milik klien lain tetap mendapat status HTTP 404 yang sebenarnya.
export default function PortalProjectsLoading() {
  return (
    <>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-xl border bg-card p-5 shadow-xs">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </>
  );
}
