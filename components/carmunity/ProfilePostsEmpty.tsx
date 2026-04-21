import Link from "next/link";

import { Button } from "@/components/ui/button";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export function ProfilePostsEmpty({
  isOwnProfile,
  handle,
}: {
  isOwnProfile: boolean;
  handle: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center shadow-e1 sm:px-10">
      <p className="text-lg font-semibold tracking-tight text-foreground">
        {isOwnProfile ? "First posts age into legend" : "No public posts yet"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {isOwnProfile
          ? "Share a build photo, a road-trip frame, or a question to the feed. Your profile becomes the proof of taste — one post at a time."
          : `When @${handle} posts to Carmunity, it lands here. Explore the live feed for what’s moving now.`}
      </p>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {isOwnProfile ? (
          <>
            <Button asChild className={cn("sm:min-w-[180px]", shellFocusRing)}>
              <Link href="/explore#carmunity-create-post">Write a post</Link>
            </Button>
            <Button variant="outline" asChild className={cn("border-border sm:min-w-[180px]", shellFocusRing)}>
              <Link href="/discussions">Start in Discussions</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild className={cn("sm:min-w-[180px]", shellFocusRing)}>
              <Link href="/explore">Open Carmunity</Link>
            </Button>
            <Button variant="outline" asChild className={cn("border-border sm:min-w-[180px]", shellFocusRing)}>
              <Link href={`/u/${handle}/garage`}>View garage</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
