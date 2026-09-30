"use client";

import { useRouter } from "next/navigation";
import { TableRow } from "@/components/ui/table";

type TableLinkRowProps = {
  href: string;
  children: React.ReactNode;
};

// Seluruh baris bisa diklik. Tetap pasang <Link> di salah satu sel agar bisa dibuka lewat keyboard atau tab baru.
export function TableLinkRow({ href, children }: TableLinkRowProps) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer"
      onMouseEnter={() => router.prefetch(href)}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("a, button")) return;
        router.push(href);
      }}
    >
      {children}
    </TableRow>
  );
}
