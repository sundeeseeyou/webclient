import Link from "next/link";
import { Button } from "@/components/ui/button";
import { uiText } from "@/lib/labels";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold">{uiText.notFoundTitle}</h1>
        <p className="mt-2 text-muted-foreground">{uiText.notFoundBody}</p>
        <Button asChild className="mt-6">
          <Link href="/">{uiText.backToHome}</Link>
        </Button>
      </div>
    </main>
  );
}
