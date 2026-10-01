import Image from "next/image";
import { cn } from "cn";
import { uiText } from "@/lib/labels";

type WordmarkProps = {
  compact?: boolean;
  onPrimary?: boolean;
};

// Latar logo sama persis dengan warna primary, jadi di panel berlatar primary yang terlihat hanya blok putihnya.
export function Wordmark({ compact = false, onPrimary = false }: WordmarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/logo.png" alt="" width={36} height={36} loading="eager" className="size-9 shrink-0 rounded-lg" />
      <span
        className={cn(
          "font-heading text-xl font-semibold",
          onPrimary ? "text-primary-foreground" : "text-foreground",
          compact && "sr-only",
        )}
      >
        {uiText.appName}
      </span>
    </span>
  );
}
