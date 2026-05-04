import Link from "next/link";
import { ChevronRight, MessagesSquare, Search } from "lucide-react";
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
        "rounded-2xl border border-border bg-card shadow-e1 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Carmunity Forums</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Trending threads — jump in</p>
      </div>

      {/* Thread list */}
      <ul className="divide-y divide-border">
        {threads.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            Forums are quiet right now. Start a thread.
          </li>
        ) : (
          threads.map((t) => (
            <li key={t.id}>
              <Link
                href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                className={cn(
                  "group flex items-center gap-3 px-4 py-2.5 transition hover:bg-muted/40",
                  shellFocusRing
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/60 text-sm">
                  💬
                </div>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-xs font-semibold text-foreground group-hover:text-primary">
                    {t.title}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">
                    {t.gearSlug} · {t.replyCount} {t.replyCount === 1 ? "reply" : "replies"}
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
              </Link>
            </li>
          ))
        )}
      </ul>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Link
          href="/discussions"
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/50",
            shellFocusRing
          )}
        >
          <MessagesSquare className="h-3.5 w-3.5 opacity-70" aria-hidden />
          Browse all discussions
        </Link>
      </div>
    </section>
  );
}
