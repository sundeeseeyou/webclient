import { PiUserCircle } from "react-icons/pi";
import { AddAccountDialog } from "@/components/admin/clients/add-account-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ClientDetail } from "@/lib/clients";
import { formatDate } from "@/lib/format";

type ClientAccountsTabProps = {
  clientId: string;
  isActive: boolean;
  users: ClientDetail["users"];
};

export function ClientAccountsTab({ clientId, isActive, users }: ClientAccountsTabProps) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={PiUserCircle}
        title="Belum ada akun login"
        description="Klien belum bisa masuk ke portal. Klik 'Tambah Akun' untuk membuatkan akun."
        action={<AddAccountDialog clientId={clientId} />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          {isActive
            ? "Semua akun di bawah ini bisa masuk ke portal klien."
            : "Klien sedang nonaktif, jadi akun di bawah ini tidak bisa masuk ke portal."}
        </p>
        <AddAccountDialog clientId={clientId} />
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama</TableHead>
              <TableHead>Email login</TableHead>
              <TableHead>Dibuat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
