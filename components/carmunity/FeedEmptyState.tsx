import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Aspirational empty state for explore feed — primary + secondary CTAs.
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
    <div className="rounded-2xl border border-dashed border-border/60 bg-gradient-to-b from-muted/25 to-muted/10 px-6 py-12 text-center sm:px-10">
      <p className="font-display text-lg font-semibold tracking-tight text-foreground">
        {isFollowing ? "Your Following feed is open road" : "The feed is ready for the first lap"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {isFollowing
          ? "Follow collectors you care about — their posts land here. Meanwhile, catch momentum in Trending."
          : "Share a build update, a garage moment, or a find. Quiet feeds are a chance to set the tone."}
      </p>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {currentUserId ? (
          <Button asChild className="sm:min-w-[180px]">
            <a href="#carmunity-create-post">Write a post</a>
          </Button>
        ) : (
          <Button asChild className="sm:min-w-[180px]">
            <Link href="/auth/sign-in">Sign in to post</Link>
          </Button>
        )}
        <Button variant="outline" asChild className="sm:min-w-[180px]">
          <Link href={isFollowing ? "/explore?tab=trending" : "/forums"}>
            {isFollowing ? "Browse Trending" : "Open Forums"}
          </Link>
        </Button>
      </div>
      {currentUserId ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Jump to the composer at the top, or tap “Write a post” to scroll there.
        </p>
      ) : null}
    </div>
  );
}
