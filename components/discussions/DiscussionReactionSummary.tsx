import type { DiscussionReactionTotals } from "@/lib/forums/forum-service";
import { cn } from "@/lib/utils";

const KIND_ORDER = [
  "LIKE",
  "FIRE",
  "WRENCH",
  "MIND_BLOWN",
  "LAUGH",
  "RESPECT",
] as const;

const SHORT: Record<(typeof KIND_ORDER)[number], string> = {
  LIKE: "Like",
  FIRE: "Fire",
  WRENCH: "Wrench",
  MIND_BLOWN: "Mind",
  LAUGH: "Laugh",
  RESPECT: "Respect",
};

export function DiscussionReactionSummary({
  summary,
  className,
  compact = true,
}: {
  summary: DiscussionReactionTotals;
  className?: string;
  compact?: boolean;
}) {
  if (summary.total === 0) {
    return (
      <span className={cn("text-xs tabular-nums text-muted-foreground", className)}>
        0 reactions
      </span>
    );
  }

  const parts = KIND_ORDER.filter((k) => (summary.byKind[k] ?? 0) > 0).map((k) => {
    const n = summary.byKind[k] ?? 0;
    return `${SHORT[k]} ${n}`;
  });

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums text-primary/90",
        className
      )}
      title={parts.join(" · ")}
    >
      <span className="font-semibold text-primary">{summary.total}</span>
      {!compact && parts.length > 0 ? (
        <span className="text-muted-foreground">{parts.join(" · ")}</span>
      ) : null}
    </span>
  );
}
