import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRequestsLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat daftar permintaan">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <Skeleton className="h-10 w-full lg:w-48" />
        <Skeleton className="h-10 w-full lg:w-44" />
        <Skeleton className="h-10 w-full lg:w-56" />
        <Skeleton className="h-10 w-52" />
      </div>
      <Card className="gap-0 py-0">
        <div className="h-11 border-b bg-muted/40" />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b px-4 py-4 last:border-0">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-32 sm:block" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="hidden h-4 w-32 md:block" />
          </div>
        ))}
      </Card>
    </div>
  );
}
