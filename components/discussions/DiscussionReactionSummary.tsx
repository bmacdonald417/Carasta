import type { DiscussionReactionTotals } from "@/lib/forums/forum-service";
import {
  DISCUSSION_REACTION_EMOJI,
  DISCUSSION_REACTION_KIND_ORDER,
  DISCUSSION_REACTION_LABELS,
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

  const titleParts = DISCUSSION_REACTION_KIND_ORDER.filter((k) => (summary.byKind[k] ?? 0) > 0).map(
    (k) => {
      const n = summary.byKind[k] ?? 0;
      return `${DISCUSSION_REACTION_LABELS[k]}: ${n}`;
    }
  );

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums text-primary/90 transition-colors duration-150",
        viewerActive && "text-primary",
        className
      )}
      title={titleParts.join(" · ")}
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
      {compact && titleParts.length > 0 ? (
        <span className="ml-1 inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-muted-foreground">
          {DISCUSSION_REACTION_KIND_ORDER.filter((k) => (summary.byKind[k] ?? 0) > 0).map((k) => {
            const n = summary.byKind[k] ?? 0;
            return (
              <span key={k} className="inline-flex items-center gap-0.5">
                <span className="text-sm leading-none" aria-hidden>
                  {DISCUSSION_REACTION_EMOJI[k]}
                </span>
                <span className="tabular-nums text-[11px] text-muted-foreground/90">×{n}</span>
              </span>
            );
          })}
        </span>
      ) : null}
      {!compact && titleParts.length > 0 ? (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
          {DISCUSSION_REACTION_KIND_ORDER.filter((k) => (summary.byKind[k] ?? 0) > 0).map((k) => {
            const n = summary.byKind[k] ?? 0;
            return (
              <span key={k} className="inline-flex items-center gap-0.5">
                <span className="text-base leading-none" aria-hidden>
                  {DISCUSSION_REACTION_EMOJI[k]}
                </span>
                <span className="tabular-nums text-xs text-muted-foreground">×{n}</span>
              </span>
            );
          })}
        </span>
      ) : null}
    </span>
  );
}
