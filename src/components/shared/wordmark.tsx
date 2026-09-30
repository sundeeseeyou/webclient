import { cn } from "cn";
import { uiText } from "@/lib/labels";

type WordmarkProps = {
  compact?: boolean;
  onPrimary?: boolean;
};

export function Wordmark({ compact = false, onPrimary = false }: WordmarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg font-heading text-lg font-semibold",
          onPrimary ? "bg-secondary text-primary" : "bg-primary text-secondary",
        )}
      >
        B
      </span>
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
