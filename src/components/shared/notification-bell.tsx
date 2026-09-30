"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "cn";
import { PiBell } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import { uiText } from "@/lib/labels";
import type { NotificationItem, NotificationSummary } from "@/lib/notify";

const POLL_INTERVAL_MS = 30_000;

export function NotificationBell({ initial }: { initial: NotificationSummary }) {
  const router = useRouter();
  const [summary, setSummary] = useState(initial);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    const result = await apiRequest<NotificationSummary>("/api/notifications");
    if (result.data) setSummary(result.data);
  };

  // Tidak realtime: cek notifikasi baru berkala hanya saat tab sedang dibuka.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const markRead = async (id?: string) => {
    await apiRequest("/api/notifications/read", { method: "POST", body: id ? { id } : {} });
    await refresh();
  };

  const openItem = async (item: NotificationItem) => {
    setOpen(false);
    if (!item.readAt) await markRead(item.id);
    if (item.link) router.push(item.link);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void refresh();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full text-muted-foreground">
          <PiBell className="size-5" />
          {summary.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {summary.unreadCount > 9 ? "9+" : summary.unreadCount}
            </span>
          )}
          <span className="sr-only">
            {summary.unreadCount > 0 ? uiText.unreadNotifications(summary.unreadCount) : uiText.notifications}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] max-w-sm p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <p className="font-heading text-base font-semibold">{uiText.notifications}</p>
          {summary.unreadCount > 0 && (
            <button type="button" onClick={() => void markRead()} className="text-xs font-medium text-primary hover:underline">
              {uiText.markAllRead}
            </button>
          )}
        </div>
        {summary.items.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">{uiText.noNotifications}</p>
        ) : (
          <ul className="max-h-96 divide-y overflow-y-auto">
            {summary.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => void openItem(item)}
                  className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", !item.readAt && "bg-primary")} />
                  <span className="min-w-0">
                    <span className={cn("block", !item.readAt && "font-medium")}>{item.title}</span>
                    <span className="block text-muted-foreground">{item.body}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{formatDateTime(new Date(item.createdAt))}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
