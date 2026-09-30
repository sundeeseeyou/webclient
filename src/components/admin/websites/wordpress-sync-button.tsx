"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PiArrowsClockwise } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

export function WordPressSyncButton({ websiteId }: { websiteId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSync = () =>
    startTransition(async () => {
      const result = await apiRequest<{ synced: number }>(`/api/websites/${websiteId}/sync-wordpress`, { method: "POST" });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      toast.success(
        result.data.synced > 0
          ? `${result.data.synced} artikel berhasil disinkronkan dari WordPress.`
          : "Sinkron selesai. Belum ada artikel di WordPress.",
      );
      router.refresh();
    });

  return (
    <Button variant="outline" size="sm" onClick={handleSync} disabled={isPending}>
      <PiArrowsClockwise />
      {isPending ? "Menyinkronkan..." : "Sinkron dari WordPress"}
    </Button>
  );
}
