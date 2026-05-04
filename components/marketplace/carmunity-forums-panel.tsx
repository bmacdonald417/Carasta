import Link from "next/link";
import { ChevronRight, MessagesSquare } from "lucide-react";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { cn } from "@/lib/utils";
import { shellFocusRing } from "@/lib/shell-nav-styles";

export type ForumThreadPreview = {
  id: string;
  title: string;
  replyCount: number;
  gearSlug: string;
  lowerGearSlug: string;
};

export function CarmunityForumsPanel({
  threads,
  className,
}: {
  threads: ForumThreadPreview[];
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-e1 md:p-5",
        className
      )}
    >
      <div className="border-b border-border/70 pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
          Carmunity Forums
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Trending threads across gears — jump into the discussion.
        </p>
      </div>

      <ul className="mt-4 divide-y divide-border/80">
        {threads.length === 0 ? (
          <li className="py-6 text-sm text-muted-foreground">
            Forums are quiet right now. Start a thread from Discussions.
          </li>
        ) : (
          threads.map((t) => (
            <li key={t.id}>
              <Link
                href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                className={cn(
                  "group flex items-start justify-between gap-3 py-3 text-sm transition-colors hover:text-primary",
                  shellFocusRing,
                  "-mx-2 rounded-xl px-2"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-medium text-foreground group-hover:text-primary">
                    {t.title}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {t.gearSlug} · {t.replyCount} replies
                  </span>
                </span>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
              </Link>
            </li>
          ))
        )}
      </ul>

      <div className="mt-4">
        <Link
          href="/discussions"
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/50",
            shellFocusRing
          )}
        >
          <MessagesSquare className="h-4 w-4 opacity-70" aria-hidden />
          Browse discussions
        </Link>
      </div>
    </section>
  );
}
