import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

/**
 * Lightweight guidance for owners with little surface area yet — Phase K polish.
 */
export function ProfileCarmunitySetupStrip({ handle }: { handle: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-e1">
      <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide">
        Get started
      </Badge>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">Build your Carmunity presence</h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        Profiles shine through motion: a post in the feed, a thread in Discussions, a car in the garage. Pick one
        lane to start — the rest compounds naturally.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild size="sm" className={cn(shellFocusRing)}>
          <Link href="/explore#carmunity-create-post">Write a post</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className={cn("border-border", shellFocusRing)}>
          <Link href="/discussions">Join discussions</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className={cn("border-border", shellFocusRing)}>
          <Link href={`/u/${encodeURIComponent(handle)}/garage`}>Add to garage</Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className={cn("text-muted-foreground hover:text-foreground", shellFocusRing)}>
          <Link href="/explore?tab=following">Find people to follow</Link>
        </Button>
      </div>
    </section>
  );
}
