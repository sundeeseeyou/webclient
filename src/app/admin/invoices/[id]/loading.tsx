import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminInvoiceDetailLoading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
