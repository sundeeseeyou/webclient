import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateTime } from "@/lib/format";
import { uiText } from "@/lib/labels";
import { prisma } from "@/lib/prisma";

export async function NotificationBell({ userId }: { userId: string }) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-medium text-primary-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">
            {unreadCount > 0 ? uiText.unreadNotifications(unreadCount) : uiText.notifications}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <p className="border-b px-4 py-3 font-medium">{uiText.notifications}</p>
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-muted-foreground">{uiText.noNotifications}</p>
        ) : (
          <ul className="max-h-96 divide-y overflow-y-auto">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex gap-3 px-4 py-3">
                <span
                  className={notification.readAt ? "mt-1.5 size-2 shrink-0" : "mt-1.5 size-2 shrink-0 rounded-full bg-primary"}
                />
                <div className="min-w-0">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-muted-foreground">{notification.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
