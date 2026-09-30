import { cn } from "cn";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type DashboardListCardProps = {
  id?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function DashboardListCard({ id, title, description, action, className, children }: DashboardListCardProps) {
  return (
    <Card id={id} className={cn("gap-0 overflow-hidden py-0", className)}>
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </Card>
  );
}
