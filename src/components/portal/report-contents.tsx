import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const contents = [
  { title: "Pengunjung dan tampilan halaman", body: "Jumlah pada bulan yang dipilih, dibandingkan dengan bulan sebelumnya." },
  { title: "Artikel terbit", body: "Judul dan tanggal artikel yang terbit pada bulan itu." },
  { title: "Permintaan selesai", body: "Permintaan perubahan yang selesai dikerjakan tim Boowat pada bulan itu." },
  { title: "Proyek berjalan", body: "Status dan progres proyek yang sedang dikerjakan saat laporan diunduh." },
  { title: "Masa aktif", body: "Tanggal perpanjangan domain dan hosting website." },
];

export function ReportContents({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Isi laporan</CardTitle>
        <CardDescription>Laporan berbentuk PDF dan bisa dibagikan ke tim Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {contents.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
