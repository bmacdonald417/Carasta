import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function InlineSpinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-live="polite" aria-label={label}>
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-current opacity-80" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

