"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export type TrendingThreadLite = {
  id: string;
  title: string;
  gearSlug: string;
  lowerGearSlug: string;
};

function fireCarmunityClientEvent(type: string, meta?: Record<string, unknown>) {
  void fetch("/api/carmunity/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, meta }),
    keepalive: true,
  });
}

export function ExploreTrendingThreads({
  threads,
  currentUserId,
  className,
  compact = false,
}: {
  threads: TrendingThreadLite[];
  currentUserId: string | null;
  className?: string;
  /** Tighter list for the right rail. */
  compact?: boolean;
}) {
  if (threads.length === 0) return null;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-e2 ring-1 ring-primary/[0.06]",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b border-border/60 bg-primary/[0.04] px-4 py-3",
          compact && "px-3 py-2.5"
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <MessageSquare className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              From discussions
            </p>
            <h2
              className={cn(
                "font-semibold leading-tight text-foreground",
                compact ? "text-sm" : "text-base"
              )}
            >
              Trending threads
            </h2>
          </div>
        </div>
        <Link
          href="/discussions"
          className={cn(
            "shrink-0 text-xs font-semibold text-primary hover:underline",
            shellFocusRing,
            "rounded-md"
          )}
        >
          All
        </Link>
      </div>
      <ul className="divide-y divide-border/70">
        {threads.map((t) => (
          <li key={t.id}>
            <Link
              href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
              className={cn(
                "block px-4 py-3 text-sm text-foreground transition-colors",
                compact && "px-3 py-2.5",
                shellFocusRing,
                "hover:bg-primary/[0.04] hover:text-primary"
              )}
              onClick={() => {
                if (currentUserId) {
                  fireCarmunityClientEvent("thread_open_feed", {
                    threadId: t.id,
                    surface: compact ? "explore_rail" : "explore_trending_strip",
                  });
                }
              }}
            >
              <span className="line-clamp-2 font-medium leading-snug">{t.title}</span>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {t.gearSlug} / {t.lowerGearSlug}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
