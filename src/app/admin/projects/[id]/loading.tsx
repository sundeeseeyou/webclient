import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProjectDetailLoading() {
  return (
    <>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-6 w-72 max-w-full" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="mb-6 h-9 w-full sm:w-80" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
