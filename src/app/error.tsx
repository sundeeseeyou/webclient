"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <ErrorState digest={error.digest} retry={retry} />
      </div>
    </main>
  );
}
