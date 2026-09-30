import Link from "next/link";
import { ClientStatusBadge } from "@/components/admin/clients/client-status-badge";
import { TableLinkRow } from "@/components/shared/table-link-row";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ClientListItem } from "@/lib/clients";

export function ClientsTable({ clients }: { clients: ClientListItem[] }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead>Perusahaan</TableHead>
            <TableHead>Nama PIC</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telepon</TableHead>
            <TableHead className="text-right">Website</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const href = `/admin/clients/${client.id}`;
            return (
              <TableLinkRow key={client.id} href={href}>
                <TableCell>
                  <Link href={href} className="font-medium transition-colors hover:text-primary">
                    {client.company}
                  </Link>
                </TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell className="text-muted-foreground">{client.email}</TableCell>
                <TableCell className="text-muted-foreground">{client.phone ?? "-"}</TableCell>
                <TableCell className="text-right tabular-nums">{client._count.websites}</TableCell>
                <TableCell>
                  <ClientStatusBadge isActive={client.isActive} />
                </TableCell>
              </TableLinkRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
