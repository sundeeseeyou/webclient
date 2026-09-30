"use client";

import { cn } from "cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PiWarningCircle } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { requestPriorityLabels, requestStatusLabels } from "@/lib/labels";

// Radix Select tidak menerima value kosong, jadi "semua" diwakili nilai khusus ini.
const ALL = "all";

// Nama parameter URL (?status=&priority=&clientId=&overdue=1) juga dipakai tautan dari dashboard admin.
type Filters = { status?: string; priority?: string; clientId?: string; overdue: boolean };

type RequestFiltersProps = Filters & {
  clients: { id: string; company: string }[];
};

type FilterSelectProps = {
  label: string;
  allLabel: string;
  value?: string;
  options: [string, string][];
  className: string;
  onChange: (value?: string) => void;
};

function FilterSelect({ label, allLabel, value, options, className, onChange }: FilterSelectProps) {
  return (
    <Select value={value ?? ALL} onValueChange={(next) => onChange(next === ALL ? undefined : next)}>
      <SelectTrigger className={cn("w-full bg-card", className)} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map(([optionValue, optionLabel]) => (
          <SelectItem key={optionValue} value={optionValue}>
            {optionLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RequestFilters({ clients, ...current }: RequestFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isFiltered = Boolean(current.status || current.priority || current.clientId || current.overdue);

  const apply = (next: Partial<Filters>) => {
    const merged = { ...current, ...next };
    const params = new URLSearchParams();
    if (merged.status) params.set("status", merged.status);
    if (merged.priority) params.set("priority", merged.priority);
    if (merged.clientId) params.set("clientId", merged.clientId);
    if (merged.overdue) params.set("overdue", "1");
    const query = params.toString();
    startTransition(() => router.push(query ? `/admin/requests?${query}` : "/admin/requests"));
  };

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center" aria-busy={isPending}>
      <FilterSelect
        label="Saring berdasarkan status"
        allLabel="Semua status"
        value={current.status}
        options={Object.entries(requestStatusLabels)}
        className="lg:w-48"
        onChange={(status) => apply({ status })}
      />
      <FilterSelect
        label="Saring berdasarkan prioritas"
        allLabel="Semua prioritas"
        value={current.priority}
        options={Object.entries(requestPriorityLabels)}
        className="lg:w-44"
        onChange={(priority) => apply({ priority })}
      />
      <FilterSelect
        label="Saring berdasarkan klien"
        allLabel="Semua klien"
        value={current.clientId}
        options={clients.map((client) => [client.id, client.company])}
        className="lg:w-56"
        onChange={(clientId) => apply({ clientId })}
      />
      <Button
        type="button"
        variant={current.overdue ? "default" : "outline"}
        aria-pressed={current.overdue}
        className={cn("self-start lg:self-auto", !current.overdue && "bg-card")}
        onClick={() => apply({ overdue: !current.overdue })}
      >
        <PiWarningCircle />
        Hanya yang melewati SLA
      </Button>
      {isFiltered && (
        <Button variant="ghost" asChild className="self-start lg:self-auto">
          <Link href="/admin/requests">Hapus filter</Link>
        </Button>
      )}
    </div>
  );
}
