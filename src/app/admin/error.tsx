"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function SectionError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState digest={error.digest} retry={retry} />;
}
