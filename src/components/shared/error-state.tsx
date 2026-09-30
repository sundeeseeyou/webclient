"use client";

import Link from "next/link";
import { PiWarningCircle } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { uiText } from "@/lib/labels";

type ErrorStateProps = {
  digest?: string;
  retry: () => void;
};

// Pesan asli error server tidak ditampilkan; kode digest cukup untuk mencocokkan log server.
export function ErrorState({ digest, retry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-14 text-center shadow-xs">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <PiWarningCircle className="size-6" />
      </span>
      <h1 className="text-xl font-semibold">{uiText.errorTitle}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{uiText.errorBody}</p>
      {digest && <p className="mt-2 text-xs text-muted-foreground">{uiText.errorCode(digest)}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={() => retry()}>{uiText.retry}</Button>
        <Button variant="outline" asChild>
          <Link href="/">{uiText.backToHome}</Link>
        </Button>
      </div>
    </div>
  );
}
