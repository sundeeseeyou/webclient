import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="h-11 border-b bg-muted/50" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-6 border-b px-4 py-3.5 last:border-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="hidden h-4 w-32 sm:block" />
          <Skeleton className="hidden h-4 w-44 md:block" />
          <Skeleton className="ml-auto h-5 w-16 rounded-full" />
        </div>
      ))}
    </Card>
  );
}

function HeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

export function ClientListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat daftar klien">
      <HeaderSkeleton />
      <div className="mb-4 flex gap-2 sm:max-w-md">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-16" />
      </div>
      <TableRowsSkeleton />
    </div>
  );
}

export function ClientDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat detail klien">
      <HeaderSkeleton />
      <Card className="mb-6 px-5">
        <Skeleton className="h-5 w-48" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </Card>
      <Skeleton className="mb-4 h-9 w-72 max-w-full" />
      <TableRowsSkeleton rows={3} />
    </div>
  );
}

export function ClientFormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat form klien">
      <HeaderSkeleton />
      <Card className="px-5">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
