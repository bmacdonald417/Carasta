"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { forwardRef, useState, useEffect } from "react";
import type { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { AppStoreBadges } from "@/components/ui/app-store-badges";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, ChevronDown, MessageSquare } from "lucide-react";
import { useHelpPalette } from "@/components/help/HelpPaletteProvider";
import { cn } from "@/lib/utils";
import {
  shellHeaderAppActive,
  shellHeaderAppInactive,
  shellHeaderAppLinkBase,
} from "@/lib/shell-nav-styles";

const footerProductLinks = [
  { href: "/explore", label: "Carmunity" },
  { href: "/discussions", label: "Discussions" },
  { href: "/auctions", label: "Market" },
  { href: "/sell", label: "Sell" },
];

/** Footer column: learn / trust paths (no longer mirrors removed marketing top strip). */
const footerLearnLinks = [
  { href: "/", label: "Home" },
  { href: "/resources", label: "Resources" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/why-carasta", label: "Why Carasta" },
  { href: "/contact", label: "Contact" },
];

const resourcesMenuLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/why-carasta", label: "Why Carasta" },
  { href: "/resources/faq", label: "FAQ" },
  { href: "/resources/trust-and-safety", label: "Trust & Safety" },
  { href: "/contact", label: "Contact" },
] as const;

function displayMenuName(session: Session | null): string {
  const u = session?.user;
  if (!u) return "Account";
  if (u.name?.trim()) return u.name.trim();
  const handle = (u as { handle?: string }).handle;
  if (handle) return `@${handle}`;
  if (u.email) return u.email.split("@")[0] ?? "Account";
  return "Account";
}

function carmunityMenuActive(pathname: string, handle?: string | null) {
  if (pathname.startsWith("/explore") || pathname.startsWith("/discussions")) return true;
  if (pathname.startsWith("/messages")) return true;
  if (handle && pathname.startsWith(`/u/${handle}`)) {
    if (pathname.includes("/listings") || pathname.includes("/marketing")) return false;
    return true;
  }
  return false;
}

function marketMenuActive(pathname: string, handle?: string | null) {
  if (pathname.startsWith("/auctions") || pathname.startsWith("/sell") || pathname.startsWith("/merch"))
    return true;
  if (handle && (pathname.startsWith(`/u/${handle}/listings`) || pathname.startsWith(`/u/${handle}/marketing`)))
    return true;
  return false;
}

function resourcesMenuActive(pathname: string) {
  if (pathname.startsWith("/resources")) return true;
  if (pathname === "/how-it-works") return true;
  if (pathname === "/why-carasta") return true;
  if (pathname === "/contact" || pathname.startsWith("/contact/")) return true;
  return false;
}

/** Pillar menus: higher z than sticky header (z-50) so portaled content paints above page chrome. */
const pillarMenuContentClass =
  "z-[100] min-w-[200px] border border-border bg-popover text-popover-foreground shadow-e2";

const PillarChevronTrigger = forwardRef<
  HTMLButtonElement,
  { children: React.ReactNode; active: boolean }
>(function PillarChevronTrigger({ children, active }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center gap-0.5",
        shellHeaderAppLinkBase,
        active ? shellHeaderAppActive : shellHeaderAppInactive
      )}
    >
      {children}
      <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
    </button>
  );
});

export function CarastaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { openPalette } = useHelpPalette();
  const [logoError, setLogoError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarSignOutStep, setAvatarSignOutStep] = useState<"idle" | "confirm">("idle");

  const handle = (session?.user as { handle?: string } | undefined)?.handle ?? null;
  const marketingEnabled = Boolean(
    (session?.user as { marketingEnabled?: boolean } | undefined)?.marketingEnabled
  );
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const isAuthShell = pathname.startsWith("/auth");
  const joinHref =
    "/auth/sign-up?callbackUrl=%2Fwelcome%3Fnext%3D%252Fexplore";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signedOutPillarLinks = (
    <>
      <Link
        href="/explore"
        data-active={pathname.startsWith("/explore") ? "true" : "false"}
        className={cn(
          shellHeaderAppLinkBase,
          pathname.startsWith("/explore") ? shellHeaderAppActive : shellHeaderAppInactive
        )}
      >
        Carmunity
      </Link>
      <Link
        href="/auctions"
        data-active={pathname.startsWith("/auctions") ? "true" : "false"}
        className={cn(
          shellHeaderAppLinkBase,
          pathname.startsWith("/auctions") ? shellHeaderAppActive : shellHeaderAppInactive
        )}
      >
        Market
      </Link>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={resourcesMenuActive(pathname)}>
            Resources
          </PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={pillarMenuContentClass}>
          <DropdownMenuItem asChild>
            <Link href="/resources">Resources hub</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {resourcesMenuLinks.map(({ href, label }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href}>{label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const signedInPillarNav = (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={carmunityMenuActive(pathname, handle)}>
            Carmunity
          </PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={pillarMenuContentClass}>
          <DropdownMenuItem asChild>
            <Link href="/explore">Explore</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/discussions">Discussions</Link>
          </DropdownMenuItem>
          {handle ? (
            <DropdownMenuItem asChild>
              <Link href={`/u/${handle}/garage`}>Garage</Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href="/messages">Messages</Link>
          </DropdownMenuItem>
          {handle ? (
            <DropdownMenuItem asChild>
              <Link href={`/u/${handle}`}>Profile</Link>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={marketMenuActive(pathname, handle)}>Market</PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={cn(pillarMenuContentClass, "min-w-[220px]")}>
          <DropdownMenuItem asChild>
            <Link href="/auctions">Live Auctions</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/sell">Sell</Link>
          </DropdownMenuItem>
          {handle ? (
            <DropdownMenuItem asChild>
              <Link href={`/u/${handle}/listings`}>My Listings</Link>
            </DropdownMenuItem>
          ) : null}
          {handle && marketingEnabled ? (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/u/${handle}/marketing`}>Marketing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/u/${handle}/marketing/campaigns`}>Campaigns</Link>
              </DropdownMenuItem>
            </>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href="/merch">Merch</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={resourcesMenuActive(pathname)}>Resources</PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={pillarMenuContentClass}>
          <DropdownMenuItem asChild>
            <Link href="/resources">Resources hub</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {resourcesMenuLinks.map(({ href, label }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href}>{label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="carasta-theme flex min-h-screen flex-col bg-background">
      <header
        className={`sticky top-0 z-50 w-full border-b transition-[border-color,background-color,box-shadow,backdrop-filter] duration-300 ease-out ${
          scrolled
            ? "border-border/70 bg-background/80 shadow-e2 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="carasta-container flex h-16 items-center gap-4 md:h-20 md:gap-6">
          <Link
            href={session ? "/explore" : "/"}
            className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
          >
            {!logoError ? (
              <img
                src="/brand/carasta/logo-circle.png"
                alt="Carasta"
                width={48}
                height={48}
                className="h-10 w-10 object-contain md:h-12 md:w-12"
                onError={() => setLogoError(true)}
              />
            ) : null}
            <span className="carasta-marketing-display text-xl font-semibold tracking-[0.18em] text-foreground">
              Carasta
            </span>
          </Link>

          {/* Single pillar nav mount (mobile + desktop) — duplicate mounts broke Radix pillar dropdowns. */}
          {isAuthShell && !session ? (
            <span className="hidden min-w-0 flex-1 lg:block" aria-hidden />
          ) : session || !isAuthShell ? (
            <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto lg:overflow-visible">
              {session ? signedInPillarNav : signedOutPillarLinks}
            </nav>
          ) : null}

          <nav className="ml-auto flex shrink-0 items-center gap-2 text-sm sm:gap-3">
            {status === "loading" ? (
              <span className="text-muted-foreground">…</span>
            ) : session ? (
              <>
                <Link
                  href="/messages"
                  title="Messages"
                  aria-label="Messages"
                  data-active={pathname.startsWith("/messages") ? "true" : "false"}
                  className={cn(
                    "inline-flex rounded-full p-2",
                    shellHeaderAppLinkBase,
                    pathname.startsWith("/messages") ? shellHeaderAppActive : shellHeaderAppInactive
                  )}
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <NotificationDropdown />
                <DropdownMenu
                  onOpenChange={(open) => {
                    if (!open) setAvatarSignOutStep("idle");
                  }}
                >
                  <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={session.user?.image ?? undefined} />
                      <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                        {(session.user?.name ?? "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-[220px] border border-border bg-popover text-popover-foreground shadow-e2 backdrop-blur-xl"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          handle ? `/u/${handle}` : "/settings"
                        }
                        className="font-medium"
                      >
                        {displayMenuName(session)}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>

                    {handle ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/u/${handle}/listings`}>My Listings</Link>
                        </DropdownMenuItem>
                        {session.user?.handle && session.user.marketingEnabled ? (
                          <DropdownMenuItem asChild>
                            <Link href={`/u/${session.user.handle}/marketing`}>Marketing</Link>
                          </DropdownMenuItem>
                        ) : null}
                      </>
                    ) : null}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        openPalette();
                      }}
                      className="cursor-pointer"
                    >
                      <span className="flex w-full items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <span>Quick help</span>
                        <kbd className="ml-auto rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          ⌃ /
                        </kbd>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/resources" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden />
                        Help center
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/marketing">Marketing summary</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/feedback">Element Feedback</Link>
                        </DropdownMenuItem>
                      </>
                    ) : null}

                    <DropdownMenuSeparator />
                    {avatarSignOutStep === "idle" ? (
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setAvatarSignOutStep("confirm");
                        }}
                        className="cursor-pointer"
                      >
                        Sign out
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <div className="px-2 py-2 text-xs leading-snug text-muted-foreground">
                          Sign out of Carasta?
                        </div>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setAvatarSignOutStep("idle");
                          }}
                          className="cursor-pointer"
                        >
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            void signOut({ callbackUrl: "/" });
                          }}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          Sign out
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : isAuthShell ? (
              <>
                <Link
                  href="/"
                  className="font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Home
                </Link>
                {pathname.includes("sign-in") ? (
                  <Link
                    href={joinHref}
                    className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 sm:px-4 sm:text-sm"
                  >
                    Join Carmunity
                  </Link>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    className="font-medium text-muted-foreground transition hover:text-primary"
                  >
                    Sign in
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="font-medium text-muted-foreground transition hover:text-primary"
                >
                  Sign in
                </Link>
                <Link
                  href={joinHref}
                  className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 sm:px-4 sm:text-sm md:inline-flex"
                >
                  Join Carmunity
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="flex flex-1">
        <AppSidebar />
        <main className="min-w-0 flex-1 bg-background pb-16 text-foreground lg:pb-0">
          {children}
        </main>
      </div>

      <MobileBottomNav />

      <footer className="mt-auto">
        <div className="relative border-t border-border/60 bg-background pt-16 pb-24 md:pt-20 md:pb-28">
          <div className="carasta-container">
            <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
              <div>
                <div className="flex items-center gap-2">
                  <img
                    src="/brand/carasta/wordmark.png"
                    alt="Carasta"
                    width={180}
                    height={48}
                    className="h-10 object-contain object-left md:h-12"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="carasta-marketing-display text-2xl font-semibold tracking-[0.15em] text-foreground md:text-3xl">
                    Carasta
                  </span>
                </div>
                <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
                  Carmunity by Carasta brings discussions, profiles, Garage
                  identity, messaging, auctions, and seller tools into one
                  platform built for enthusiasts.
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  <Link
                    href={joinHref}
                    className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Join Carmunity
                  </Link>
                  <Link
                    href="/auctions"
                    className="rounded-full border border-border px-4 py-2 font-semibold text-foreground transition hover:bg-muted/60"
                  >
                    Market
                  </Link>
                </div>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-1">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    Learn
                  </p>
                  <nav className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                    {footerLearnLinks.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="transition hover:text-foreground"
                      >
                        {label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    Support
                  </p>
                  <nav className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                    {[
                      { href: "/resources/faq", label: "FAQ" },
                      { href: "/resources/glossary", label: "Glossary" },
                      { href: "/resources/trust-and-safety", label: "Trust & Safety" },
                      { href: "/contact", label: "Get Help" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="transition hover:text-foreground"
                      >
                        {label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-1">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    Product
                  </p>
                  <nav className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                    {[
                      ...footerProductLinks,
                      { href: "/messages", label: "Messages" },
                      { href: "/community-guidelines", label: "Community Guidelines" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="transition hover:text-foreground"
                      >
                        {label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    Contact
                  </p>
                  <a
                    href="mailto:info@carasta.com"
                    className="mt-4 inline-block text-primary/90 hover:text-primary"
                  >
                    info@carasta.com
                  </a>
                  <div className="mt-5">
                    <p className="text-xs text-muted-foreground">
                      Carmunity on mobile
                    </p>
                    <div className="mt-3">
                      <AppStoreBadges />
                    </div>
                    <p className="mt-3 max-w-xs text-[11px] leading-relaxed text-muted-foreground">
                      Same account identity and social graph as the web product,
                      with a narrower surface area for now.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        </div>
        <div className="border-t border-border/60 bg-background py-6">
          <div className="carasta-container flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Carasta. All rights reserved.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Carmunity by Carasta — feed, discussions, garage, and auctions
                in one place.
              </p>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm md:justify-end">
              <Link
                href="/terms"
                className="text-muted-foreground transition hover:text-primary"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground transition hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/community-guidelines"
                className="text-muted-foreground transition hover:text-primary"
              >
                Community Guidelines
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
