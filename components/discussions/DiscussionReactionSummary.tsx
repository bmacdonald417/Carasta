import type { DiscussionReactionTotals } from "@/lib/forums/forum-service";
import {
  DISCUSSION_REACTION_COMPACT,
  DISCUSSION_REACTION_KIND_ORDER,
} from "@/lib/discussions/reaction-labels";
import { cn } from "@/lib/utils";

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

  const parts = DISCUSSION_REACTION_KIND_ORDER.filter((k) => (summary.byKind[k] ?? 0) > 0).map(
    (k) => {
      const n = summary.byKind[k] ?? 0;
      return `${DISCUSSION_REACTION_COMPACT[k]} ${n}`;
    }
  );

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
