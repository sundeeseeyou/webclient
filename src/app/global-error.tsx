"use client";

import { ErrorState } from "@/components/shared/error-state";
import "./globals.css";

// Menggantikan root layout saat layout itu sendiri gagal, jadi harus membawa <html> dan <body> sendiri.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="id">
      <body className="min-h-screen font-sans text-sm">
        <title>Terjadi kesalahan | Boowat</title>
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-lg">
            <ErrorState digest={error.digest} retry={retry} />
          </div>
        </main>
      </body>
    </html>
  );
}
