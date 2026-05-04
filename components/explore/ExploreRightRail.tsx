import Link from "next/link";
import { Gavel, Sparkles, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ExploreTrendingThreads,
  type TrendingThreadLite,
} from "@/components/explore/ExploreTrendingThreads";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

function nextUrl(s: string) {
  const safe = s.startsWith("/") ? s : "/explore";
  const activation = `/welcome?next=${encodeURIComponent(safe)}`;
  return {
    signUp: `/auth/sign-up?callbackUrl=${encodeURIComponent(activation)}`,
    signIn: `/auth/sign-in?callbackUrl=${encodeURIComponent(activation)}`,
  };
}

const quickLinks = [
  { href: "/discussions", label: "Discussions" },
  { href: "/auctions", label: "Live auctions" },
  { href: "/how-it-works", label: "How it works" },
] as const;

export function ExploreRightRail({
  trendingThreads,
  currentUserId,
  nextPath = "/explore",
}: {
  trendingThreads: TrendingThreadLite[];
  currentUserId: string | null;
  nextPath?: string;
}) {
  const { signUp, signIn } = nextUrl(nextPath);
  const showJoin = !currentUserId;

  return (
    <div className="space-y-6">
      {showJoin ? (
        <div
          className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-primary/[0.04] p-4 shadow-e2 ring-1 ring-primary/10"
          role="region"
          aria-label="Join Carmunity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <UserPlus className="h-4 w-4" aria-hidden />
          </div>
          <p className="mt-3 text-sm font-semibold leading-snug text-foreground">
            Join the lane
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            React, comment, follow garages, and personalize your feed — free.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild size="sm" className="w-full rounded-xl font-semibold shadow-sm">
              <Link href={signUp}>Join Carmunity</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full rounded-xl text-muted-foreground">
              <Link href={signIn}>Sign in</Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-e2 ring-1 ring-primary/[0.05]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <h3 className="text-sm font-semibold text-foreground">Explore</h3>
        </div>
        <ul className="mt-3 space-y-1">
          {quickLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "-mx-2 flex items-center rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
                  shellFocusRing
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/sell"
              className={cn(
                "-mx-2 flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
                shellFocusRing
              )}
            >
              <Gavel className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              Sell a vehicle
            </Link>
          </li>
        </ul>
      </div>

      <ExploreTrendingThreads
        threads={trendingThreads}
        currentUserId={currentUserId}
        compact
        className="shadow-e1"
      />
    </div>
  );
}
