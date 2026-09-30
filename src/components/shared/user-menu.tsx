"use client";

import { useTransition } from "react";
import { PiCaretDown, PiSignOut } from "react-icons/pi";
import { logout } from "@/app/(auth)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roleLabels, uiText } from "@/lib/labels";
import type { SessionUser } from "@/lib/rbac";

function initials(name: string): string {
  return name
    .replace(/^(drg|dr|ir|h)\.\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu({ user }: { user: Pick<SessionUser, "name" | "email" | "role"> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg py-1 pr-1 pl-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:pr-2">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials(user.name)}
        </span>
        <span className="hidden max-w-40 truncate font-medium sm:inline">{user.name}</span>
        <PiCaretDown className="hidden size-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">{roleLabels[user.role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isPending}
          onSelect={(event) => {
            event.preventDefault();
            startTransition(() => logout());
          }}
          className="gap-2.5 py-2"
        >
          <PiSignOut className="size-5 text-muted-foreground" />
          {isPending ? uiText.processing : uiText.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
