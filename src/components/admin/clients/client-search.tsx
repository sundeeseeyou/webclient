import Form from "next/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClientSearch({ query }: { query: string }) {
  return (
    <Form action="/admin/clients" replace className="flex w-full gap-2 sm:max-w-md">
      <label htmlFor="client-search" className="sr-only">
        Cari klien
      </label>
      {/* key: isi kotak pencarian ikut berganti saat URL berubah, misalnya setelah "Tampilkan semua". */}
      <Input
        key={query}
        id="client-search"
        name="q"
        type="search"
        defaultValue={query}
        placeholder="Cari nama atau perusahaan"
        className="bg-card"
      />
      <Button type="submit" variant="outline" className="bg-card">
        Cari
      </Button>
    </Form>
  );
}
