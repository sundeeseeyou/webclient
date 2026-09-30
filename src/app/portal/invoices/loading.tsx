import { Skeleton } from "@/components/ui/skeleton";

// Aman dipasang di sini karena portal tidak punya halaman detail invoice; skeleton ini hanya membungkus halaman daftar.
export default function PortalInvoicesLoading() {
  return (
    <>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="mb-4 space-y-2 rounded-xl border bg-card px-5 py-4 shadow-xs">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="divide-y rounded-xl border bg-card shadow-xs">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56 max-w-full" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
