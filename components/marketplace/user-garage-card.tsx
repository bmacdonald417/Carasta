import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { shellFocusRing } from "@/lib/shell-nav-styles";

export type GarageTile = {
  id: string;
  year: number;
  make: string;
  model: string;
  imageUrl: string | null;
};

export function UserGarageCard({
  variant,
  handle,
  displayName,
  location,
  avatarUrl,
  stats,
  garage,
  className,
}: {
  variant: "signed-in" | "guest";
  handle?: string | null;
  displayName?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  stats?: { posts: number; followers: number; following: number };
  garage: GarageTile[];
  className?: string;
}) {
  if (variant === "guest") {
    return (
      <section
        className={cn(
          "rounded-2xl border border-border bg-card shadow-e1 overflow-hidden",
          className
        )}
      >
        <div className="bg-gradient-to-br from-primary/10 to-accent px-4 pt-6 pb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/30 bg-card text-2xl shadow-e1">
            👤
          </div>
          <h2 className="text-sm font-semibold text-foreground">Your Carmunity profile</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in to show your garage, followers, and feed.
          </p>
        </div>
        <div className="flex flex-col gap-2 p-3">
          <Link
            href="/auth/sign-up?callbackUrl=%2Fwelcome%3Fnext%3D%252Fexplore"
            className={cn(
              "inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-e1 transition hover:bg-[hsl(var(--primary-hover))]",
              shellFocusRing
            )}
          >
            Join Carmunity
          </Link>
          <Link
            href="/auth/sign-in?callbackUrl=%2F"
            className={cn(
              "inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/50",
              shellFocusRing
            )}
          >
            Log in
          </Link>
        </div>
      </section>
    );
  }

  const profileHref = handle ? `/u/${handle}` : "/settings";
  const garageHref = handle ? `/u/${handle}/garage` : "/settings";
  const editGarageHref = "/garage/add";

  const initials = (displayName ?? handle ?? "U").slice(0, 2).toUpperCase();

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card shadow-e1 overflow-hidden",
        className
      )}
    >
      {/* Profile header */}
      <div className="border-b border-border bg-accent/30 px-4 pb-4 pt-5 text-center">
        <div className="relative inline-block mb-2">
          <Avatar className="h-14 w-14 rounded-full border-2 border-primary ring-2 ring-primary/20">
            <AvatarImage src={avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-[hsl(var(--success))] ring-2 ring-card" />
        </div>
        <p className="text-sm font-semibold text-foreground">{displayName ?? (handle ? `@${handle}` : "Member")}</p>
        {location ? (
          <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            {location}
          </p>
        ) : null}
        {stats ? (
          <div className="mt-3 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card">
            <div className="px-2 py-2 text-center">
              <p className="text-sm font-bold tabular-nums text-primary">{stats.posts}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Posts</p>
            </div>
            <div className="px-2 py-2 text-center">
              <p className="text-sm font-bold tabular-nums text-primary">{stats.followers}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Followers</p>
            </div>
            <div className="px-2 py-2 text-center">
              <p className="text-sm font-bold tabular-nums text-primary">{stats.following}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Following</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Nav links */}
      <nav className="divide-y divide-border border-b border-border">
        {[
          { label: "Feed", href: "/explore", emoji: "🏠" },
          { label: "Profile", href: profileHref, emoji: "👤" },
          { label: "My Garage", href: garageHref, emoji: "🏎" },
          { label: "Dream Garage", href: "/garage/dream", emoji: "❤️" },
          { label: "Messages", href: "/messages", emoji: "💬" },
          { label: "Forums", href: "/discussions", emoji: "🗣️" },
        ].map(({ label, href, emoji }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted/40 hover:text-primary",
              shellFocusRing
            )}
          >
            <span className="text-base leading-none">{emoji}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* Garage tiles */}
      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your Garage</h3>
          <Link href={garageHref} className={cn("text-xs font-semibold text-primary hover:underline", shellFocusRing, "rounded-sm")}>View All</Link>
        </div>
        <ul className="space-y-2">
          {garage.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center text-xs text-muted-foreground">
              No vehicles yet.{" "}
              <Link href={editGarageHref} className={cn("font-semibold text-primary hover:underline", shellFocusRing, "rounded-sm")}>Add one</Link>
            </li>
          ) : (
            garage.map((car) => (
              <li key={car.id}>
                <Link
                  href={garageHref}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/60 p-2 transition hover:border-primary/30 hover:bg-accent/30",
                    shellFocusRing
                  )}
                >
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {car.imageUrl ? (
                      <Image src={car.imageUrl} alt="" fill unoptimized className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg">🚗</div>
                    )}
                  </div>
                  <p className="truncate text-xs font-semibold text-foreground">
                    {car.year} {car.make} {car.model}
                  </p>
                </Link>
              </li>
            ))
          )}
        </ul>
        <Link
          href={editGarageHref}
          className={cn(
            "mt-3 inline-flex w-full items-center justify-center rounded-xl border border-primary/20 bg-primary/8 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15",
            shellFocusRing
          )}
        >
          Edit Garage
        </Link>
      </div>
    </section>
  );
}
