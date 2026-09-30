import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RequestResponseCardProps = {
  adminResponse: string | null;
  rejectionReason: string | null;
};

// Tanggapan dan alasan penolakan yang tersimpan, sama persis dengan yang dilihat klien di portal.
export function RequestResponseCard({ adminResponse, rejectionReason }: RequestResponseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tanggapan Tersimpan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Tanggapan untuk klien</p>
          <p className="mt-1 whitespace-pre-line wrap-break-word">{adminResponse ?? "Belum ada tanggapan."}</p>
        </div>
        {rejectionReason && (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-3">
            <p className="text-xs font-medium text-danger">Alasan penolakan</p>
            <p className="mt-1 whitespace-pre-line wrap-break-word">{rejectionReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
