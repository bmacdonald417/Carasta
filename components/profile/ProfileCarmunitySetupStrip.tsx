import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Lightweight guidance for owners with little surface area yet — Phase K polish.
 */
export function ProfileCarmunitySetupStrip({ handle }: { handle: string }) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-card/40 p-5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">Get started</p>
      <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
        Build your Carmunity presence
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        Profiles shine through motion: a post in the feed, a thread in Discussions, a car in the garage.
        Pick one lane to start — the rest compounds naturally.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild size="sm" className="border-primary/30 bg-primary/15 text-primary hover:bg-primary/25">
          <Link href="/explore#carmunity-create-post">Write a post</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="border-primary/35 text-primary hover:bg-primary/10">
          <Link href="/discussions">Join discussions</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="border-border/60">
          <Link href={`/u/${encodeURIComponent(handle)}/garage`}>Add to garage</Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
          <Link href="/explore?tab=following">Find people to follow</Link>
        </Button>
      </div>
    </section>
  );
}
