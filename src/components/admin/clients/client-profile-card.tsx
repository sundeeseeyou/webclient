import { ClientStatusAction } from "@/components/admin/clients/client-status-action";
import { ClientStatusBadge } from "@/components/admin/clients/client-status-badge";
import { EditClientDialog } from "@/components/admin/clients/edit-client-dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { ClientDetail } from "@/lib/clients";
import { formatDate } from "@/lib/format";

function ProfileItem({ label, value, className }: { label: string; value: string | null; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 wrap-break-word whitespace-pre-line">{value || "-"}</dd>
    </div>
  );
}

export function ClientProfileCard({ client }: { client: ClientDetail }) {
  const { id, company, name, email, phone, address, notes } = client;

  return (
    <Card className="mb-6">
      <div className="flex flex-col gap-4 border-b px-5 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">Profil klien</h2>
            <ClientStatusBadge isActive={client.isActive} />
          </div>
          <p className="mt-1 text-muted-foreground">Terdaftar sejak {formatDate(client.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <EditClientDialog client={{ id, company, name, email, phone, address, notes }} />
          <ClientStatusAction clientId={client.id} company={client.company} isActive={client.isActive} />
        </div>
      </div>
      <CardContent className="space-y-5">
        {!client.isActive && (
          <p role="status" className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5 text-warning">
            Klien ini nonaktif. Semua akun login klien tidak bisa dipakai untuk masuk sampai klien diaktifkan kembali.
          </p>
        )}
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileItem label="Nama PIC" value={client.name} />
          <ProfileItem label="Email kontak" value={client.email} />
          <ProfileItem label="Nomor telepon" value={client.phone} />
          <ProfileItem label="Alamat" value={client.address} className="sm:col-span-2 lg:col-span-3" />
          <ProfileItem label="Catatan" value={client.notes} className="sm:col-span-2 lg:col-span-3" />
        </dl>
      </CardContent>
    </Card>
  );
}
