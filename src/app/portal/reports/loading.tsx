import { Skeleton } from "@/components/ui/skeleton";

// Aman memakai loading.tsx di sini karena /portal/reports tidak punya halaman detail yang bisa 404 (DECISIONS #76).
export default function PortalReportsLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat halaman laporan">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <div className="space-y-5 rounded-xl border bg-card p-5 shadow-xs lg:col-span-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-52" />
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-xs lg:col-span-2">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
