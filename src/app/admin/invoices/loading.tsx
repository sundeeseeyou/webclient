import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminInvoicesLoading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 w-full sm:w-56" />
        <Skeleton className="h-10 w-full sm:w-64" />
      </div>
      <Skeleton className="mb-3 h-4 w-48" />
      <Card className="gap-0 py-0">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b px-4 py-4 last:border-0">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="hidden h-4 flex-1 sm:block" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="ml-auto h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </Card>
    </>
  );
}
