"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectStatusLabels } from "@/lib/labels";

// Radix Select tidak menerima value kosong, jadi "semua" diwakili nilai khusus ini.
const ALL = "all";

// Nilai filter dari URL diperiksa ulang di server, jadi di sini cukup berupa teks.
type Filters = { status?: string; clientId?: string };

type ProjectFiltersProps = Filters & {
  clients: { id: string; company: string }[];
};

export function ProjectFilters({ clients, status, clientId }: ProjectFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const apply = (next: Filters) => {
    const merged = { status, clientId, ...next };
    const params = new URLSearchParams();
    if (merged.status) params.set("status", merged.status);
    if (merged.clientId) params.set("clientId", merged.clientId);
    const query = params.toString();
    startTransition(() => router.push(query ? `/admin/projects?${query}` : "/admin/projects"));
  };

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center" aria-busy={isPending}>
      <Select
        value={status ?? ALL}
        onValueChange={(value) => apply({ status: value === ALL ? undefined : value })}
      >
        <SelectTrigger className="w-full bg-card sm:w-56" aria-label="Saring berdasarkan status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Semua status</SelectItem>
          {Object.entries(projectStatusLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={clientId ?? ALL} onValueChange={(value) => apply({ clientId: value === ALL ? undefined : value })}>
        <SelectTrigger className="w-full bg-card sm:w-64" aria-label="Saring berdasarkan klien">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Semua klien</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.company}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(status || clientId) && (
        <Button variant="ghost" asChild className="self-start sm:self-auto">
          <Link href="/admin/projects">Hapus filter</Link>
        </Button>
      )}
    </div>
  );
}
