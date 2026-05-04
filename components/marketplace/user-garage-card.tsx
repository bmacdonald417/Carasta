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
          "rounded-2xl border border-border bg-card p-4 shadow-e1 md:p-5",
          className
        )}
      >
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Your Carmunity profile</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Sign in to show your garage, followers, and posts alongside the marketplace feed.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/auth/sign-in?callbackUrl=%2F"
            className={cn(
              "inline-flex flex-1 items-center justify-center rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/50",
              shellFocusRing
            )}
          >
            Log in
          </Link>
          <Link
            href="/auth/sign-up?callbackUrl=%2Fwelcome%3Fnext%3D%252Fexplore"
            className={cn(
              "inline-flex flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-e1 transition hover:bg-[hsl(var(--primary-hover))]",
              shellFocusRing
            )}
          >
            Join Carmunity
          </Link>
        </div>
      </section>
    );
  }

  const profileHref = handle ? `/u/${handle}` : "/settings";
  const garageHref = handle ? `/u/${handle}/garage` : "/settings";
  const editGarageHref = "/garage/add";

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-e1 md:p-5",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 rounded-full border border-border ring-1 ring-border/60">
          <AvatarImage src={avatarUrl ?? undefined} alt="" />
          <AvatarFallback>{(displayName ?? handle ?? "U").slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-foreground">
            {displayName ?? (handle ? `@${handle}` : "Member")}
          </p>
          {location ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              {location}
            </p>
          ) : null}
          {stats ? (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-muted/40 px-2 py-2">
                <p className="text-sm font-semibold tabular-nums text-foreground">{stats.posts}</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Posts</p>
              </div>
              <div className="rounded-xl bg-muted/40 px-2 py-2">
                <p className="text-sm font-semibold tabular-nums text-foreground">{stats.followers}</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Followers</p>
              </div>
              <div className="rounded-xl bg-muted/40 px-2 py-2">
                <p className="text-sm font-semibold tabular-nums text-foreground">{stats.following}</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Following</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Link
        href={profileHref}
        className={cn(
          "mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-border bg-muted/30 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/50",
          shellFocusRing
        )}
      >
        View profile
      </Link>

      <div className="mt-8 border-t border-border/70 pt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">Your garage</h3>
          <Link href={garageHref} className={cn("text-xs font-semibold text-primary hover:underline", shellFocusRing, "rounded-md")}>
            View all
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {garage.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              No vehicles yet.
              <Link href={editGarageHref} className={cn("mt-2 block font-semibold text-primary hover:underline", shellFocusRing, "rounded-md")}>
                Add your first car
              </Link>
            </li>
          ) : (
            garage.map((car) => (
              <li key={car.id}>
                <Link
                  href={garageHref}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-2 transition hover:border-primary/25",
                    shellFocusRing
                  )}
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {car.imageUrl ? (
                      <Image src={car.imageUrl} alt="" fill unoptimized className="object-cover" sizes="80px" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {car.year} {car.make} {car.model}
                    </p>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>

        <Link
          href={editGarageHref}
          className={cn(
            "mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15",
            shellFocusRing
          )}
        >
          Edit garage
        </Link>
      </div>
    </section>
  );
}
