import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProfilePostsEmpty({
  isOwnProfile,
  handle,
}: {
  isOwnProfile: boolean;
  handle: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-gradient-to-b from-muted/25 to-muted/10 px-6 py-12 text-center sm:px-10">
      <p className="font-display text-lg font-semibold tracking-tight text-foreground">
        {isOwnProfile ? "Your story starts with one post" : "No public posts yet"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {isOwnProfile
          ? "Drop a photo from the garage, a build note, or something you’re hunting. Your profile becomes the proof of taste over time."
          : `When @${handle} shares to Carmunity, it shows up here — check the feed for live momentum.`}
      </p>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {isOwnProfile ? (
          <>
            <Button asChild className="sm:min-w-[180px]">
              <Link href="/explore#carmunity-create-post">Write a post</Link>
            </Button>
            <Button variant="outline" asChild className="sm:min-w-[180px]">
              <Link href={`/u/${handle}/garage`}>Open garage</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild className="sm:min-w-[180px]">
              <Link href="/explore">Explore Carmunity</Link>
            </Button>
            <Button variant="outline" asChild className="sm:min-w-[180px]">
              <Link href={`/u/${handle}/garage`}>View garage</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
