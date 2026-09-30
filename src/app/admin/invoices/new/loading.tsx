import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewInvoiceLoading() {
  return (
    <>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Card className="max-w-4xl">
        <CardContent className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </>
  );
}
