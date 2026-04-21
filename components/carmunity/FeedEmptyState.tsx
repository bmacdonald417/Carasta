import Link from "next/link";

import { Button } from "@/components/ui/button";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

/**
 * Empty states for Carmunity feed — tokenized, calm, still inviting.
 */
export function FeedEmptyState({
  variant,
  currentUserId,
}: {
  variant: "trending" | "following";
  currentUserId: string | null;
}) {
  const isFollowing = variant === "following";

  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center shadow-e1 sm:px-10">
      <p className="text-lg font-semibold tracking-tight text-foreground">
        {isFollowing ? "Line up who you want in your lane" : "The grid is quiet — set the pace"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {isFollowing
          ? "Following blends posts and discussions from people you choose. Follow a few builders, then refresh this tab — or open Discussions to scout voices first."
          : "Trending rewards momentum: a photo drop, a sharp question, a garage flex. Lead with something real — the community meets you where you are."}
      </p>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {currentUserId ? (
          <Button asChild className={cn("sm:min-w-[180px]", shellFocusRing)}>
            <a href="#carmunity-create-post">Write a post</a>
          </Button>
        ) : (
          <Button asChild className={cn("sm:min-w-[180px]", shellFocusRing)}>
            <Link href="/auth/sign-in">Sign in to post</Link>
          </Button>
        )}
        <Button variant="outline" asChild className={cn("sm:min-w-[180px] border-border", shellFocusRing)}>
          <Link href={isFollowing ? "/discussions" : "/explore?tab=trending"}>
            {isFollowing ? "Find people in Discussions" : "See what’s trending"}
          </Link>
        </Button>
      </div>
      {isFollowing && currentUserId ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Tip: the first-run panel on Carmunity can suggest follows — reopen Explore after sign-up if you skipped it.
        </p>
      ) : null}
      {currentUserId && !isFollowing ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Jump to the composer at the top, or tap “Write a post” to scroll there.
        </p>
      ) : null}
    </div>
  );
}
