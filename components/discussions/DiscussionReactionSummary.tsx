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
  viewerActive = false,
}: {
  summary: DiscussionReactionTotals;
  className?: string;
  compact?: boolean;
  /** Subtle emphasis when the signed-in viewer has placed a reaction. */
  viewerActive?: boolean;
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
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums text-primary/90 transition-colors duration-150",
        viewerActive && "text-primary",
        className
      )}
      title={parts.join(" · ")}
    >
      {viewerActive ? (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-primary/25" aria-hidden />
      ) : null}
      <span
        className={cn(
          "font-semibold text-primary transition-transform duration-150 ease-out",
          viewerActive && "scale-105"
        )}
      >
        {summary.total}
      </span>
      {!compact && parts.length > 0 ? (
        <span className="text-muted-foreground">{parts.join(" · ")}</span>
      ) : null}
    </span>
  );
}
