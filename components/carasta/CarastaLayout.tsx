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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  ChevronDown,
  Facebook,
  Instagram,
  Menu,
  MessageSquare,
  Pencil,
  Search,
  Youtube,
} from "lucide-react";
import { useHelpPalette } from "@/components/help/HelpPaletteProvider";
import { cn } from "@/lib/utils";
import {
  shellHeaderAppActive,
  shellHeaderAppInactive,
  shellHeaderAppLinkBase,
} from "@/lib/shell-nav-styles";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SiteFooter } from "@/components/marketplace/site-footer";
import { getPublicSocialLinks } from "@/lib/marketing/social-links";

const resourcesMenuLinks = [
  { href: "/how-it-works", label: "How It Works" },
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
  if (
    pathname.startsWith("/auctions") ||
    pathname.startsWith("/sell") ||
    pathname.startsWith("/merch") ||
    pathname.startsWith("/wallet")
  )
    return true;
  if (handle && (pathname.startsWith(`/u/${handle}/listings`) || pathname.startsWith(`/u/${handle}/marketing`)))
    return true;
  return false;
}

function howCarmunityWorksMenuActive(pathname: string) {
  if (pathname === "/how-it-works" || pathname === "/resources") return true;
  if (pathname.startsWith("/resources/")) return true;
  return false;
}

function aboutMenuActive(pathname: string) {
  return (
    pathname === "/contact" ||
    pathname.startsWith("/contact/") ||
    pathname === "/community-guidelines" ||
    pathname === "/why-carasta"
  );
}

/** Pillar menus: higher z than sticky header (z-50) so portaled content paints above page chrome. */
const pillarMenuContentClass =
  "z-[100] min-w-[220px] rounded-2xl border border-border/80 bg-popover/98 p-1.5 text-popover-foreground shadow-e2 ring-1 ring-primary/12 backdrop-blur-md";

/**
 * Must forward arbitrary props from Radix `DropdownMenuTrigger asChild` (Slot merge):
 * pointer handlers, aria-*, data-state, etc. Omitting them breaks open/close and pill affordances.
 */
const PillarChevronTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    active: boolean;
    children: React.ReactNode;
  }
>(function PillarChevronTrigger(
  { children, active, className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center gap-0.5",
        shellHeaderAppLinkBase,
        active ? shellHeaderAppActive : shellHeaderAppInactive,
        className
      )}
      {...props}
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handle = (session?.user as { handle?: string } | undefined)?.handle ?? null;
  const marketingEnabled = Boolean(
    (session?.user as { marketingEnabled?: boolean } | undefined)?.marketingEnabled
  );
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const isAuthShell = pathname.startsWith("/auth");
  const joinHref =
    "/auth/sign-up?callbackUrl=%2Fwelcome%3Fnext%3D%252Fexplore";

  const publicSocialLinks = getPublicSocialLinks();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signedOutDesktopNav = (
    <>
      <Link
        href="/auctions"
        data-active={pathname.startsWith("/auctions") ? "true" : "false"}
        className={cn(
          shellHeaderAppLinkBase,
          pathname.startsWith("/auctions") ? shellHeaderAppActive : shellHeaderAppInactive
        )}
      >
        Auctions
      </Link>
      <Link
        href="/sell"
        data-active={pathname.startsWith("/sell") ? "true" : "false"}
        className={cn(
          shellHeaderAppLinkBase,
          pathname.startsWith("/sell") ? shellHeaderAppActive : shellHeaderAppInactive
        )}
      >
        List a Vehicle
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={howCarmunityWorksMenuActive(pathname)}>
            How Carmunity Works
          </PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={pillarMenuContentClass}>
          <DropdownMenuItem asChild>
            <Link href="/how-it-works">How it works</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/resources">Resources hub</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/resources/faq">FAQ</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/resources/trust-and-safety">Trust &amp; Safety</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={carmunityMenuActive(pathname, handle)}>
            Carmunity
          </PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={pillarMenuContentClass}>
          <DropdownMenuItem asChild>
            <Link href="/explore">Explore feed</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/discussions">Discussions</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={aboutMenuActive(pathname)}>About</PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={pillarMenuContentClass}>
          <DropdownMenuItem asChild>
            <Link href="/contact">Contact</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/why-carasta">About Carasta</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/community-guidelines">Community guidelines</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const signedInDesktopNav = (
    <>
      <Link
        href="/auctions"
        data-active={pathname.startsWith("/auctions") ? "true" : "false"}
        className={cn(
          shellHeaderAppLinkBase,
          pathname.startsWith("/auctions") ? shellHeaderAppActive : shellHeaderAppInactive
        )}
      >
        Auctions
      </Link>
      <Link
        href="/sell"
        data-active={pathname.startsWith("/sell") ? "true" : "false"}
        className={cn(
          shellHeaderAppLinkBase,
          pathname.startsWith("/sell") ? shellHeaderAppActive : shellHeaderAppInactive
        )}
      >
        List a Vehicle
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={carmunityMenuActive(pathname, handle)}>
            Carmunity
          </PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={pillarMenuContentClass}>
          <DropdownMenuItem asChild>
            <Link href="/explore">Explore feed</Link>
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={marketMenuActive(pathname, handle)}>Selling</PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={cn(pillarMenuContentClass, "min-w-[220px]")}>
          <DropdownMenuItem asChild>
            <Link href="/auctions">Live auctions</Link>
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
          <DropdownMenuItem asChild>
            <Link href="/wallet">Wallet</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={howCarmunityWorksMenuActive(pathname)}>
            How Carmunity Works
          </PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={pillarMenuContentClass}>
          <DropdownMenuItem asChild>
            <Link href="/how-it-works">How it works</Link>
          </DropdownMenuItem>
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PillarChevronTrigger active={aboutMenuActive(pathname)}>About</PillarChevronTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={pillarMenuContentClass}>
          <DropdownMenuItem asChild>
            <Link href="/contact">Contact</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/why-carasta">About Carasta</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/community-guidelines">Community guidelines</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="carasta-theme flex min-h-screen flex-col bg-background">
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 shadow-e1 backdrop-blur-md transition-[box-shadow] duration-300 ease-out",
          scrolled && "shadow-e2"
        )}
      >
        <div className="relative z-10 carasta-container flex h-14 min-w-0 max-w-full items-center gap-2 overflow-x-hidden sm:gap-3 md:h-[3.75rem] md:gap-4">
          {isAuthShell && !session ? null : (
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-muted/30 text-foreground transition hover:bg-muted/50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 transition-opacity hover:opacity-90 sm:gap-3">
            {!logoError ? (
              <img
                src="/brand/carasta/logo-circle.png"
                alt="Carmunity by Carasta"
                width={48}
                height={48}
                className="h-9 w-9 object-contain md:h-11 md:w-11"
                onError={() => setLogoError(true)}
              />
            ) : null}
            <span className="flex min-w-0 flex-col leading-none">
              <span className="carasta-marketing-display truncate text-base font-semibold tracking-[0.14em] text-foreground sm:text-lg">
                Carmunity
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:block">
                by Carasta
              </span>
            </span>
          </Link>

          {isAuthShell && !session ? (
            <span className="hidden min-w-0 flex-1 lg:block" aria-hidden />
          ) : session || !isAuthShell ? (
            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1">
              {session ? signedInDesktopNav : signedOutDesktopNav}
            </nav>
          ) : null}

          <nav className="ml-auto flex shrink-0 items-center gap-1.5 text-sm sm:gap-2 md:gap-3">
            {isAuthShell && !session ? null : (
              <>
                {publicSocialLinks.length > 0 ? (
                  <span className="hidden shrink-0 items-center gap-0.5 lg:inline-flex" aria-label="Carmunity social profiles">
                    {publicSocialLinks.map(({ key, href }) => {
                      const Icon = key === "instagram" ? Instagram : key === "youtube" ? Youtube : Facebook;
                      const label =
                        key === "instagram" ? "Instagram" : key === "youtube" ? "YouTube" : "Facebook";
                      return (
                        <a
                          key={key}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full p-2 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                        >
                          <Icon className="h-4 w-4" aria-hidden />
                          <span className="sr-only">{label}</span>
                        </a>
                      );
                    })}
                  </span>
                ) : null}
                <Link
                  href="/explore"
                  title="Open Carmunity feed"
                  aria-label="Open Carmunity feed"
                  className={cn(
                    "hidden shrink-0 rounded-full p-2 sm:inline-flex",
                    shellHeaderAppLinkBase,
                    pathname.startsWith("/explore") ? shellHeaderAppActive : shellHeaderAppInactive
                  )}
                >
                  <Search className="h-5 w-5" aria-hidden />
                </Link>
              </>
            )}
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
                          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
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

        <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <DialogContent
            variant="left-drawer"
            className="max-h-[100dvh] max-w-[min(100vw,400px)] gap-0 overflow-x-hidden border-0 p-0"
          >
            <div className="border-b border-white/15 px-5 pb-6 pt-14">
              {session?.user ? (
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 shrink-0 rounded-full border-2 border-white/80 bg-white/10 ring-2 ring-white/20">
                    <AvatarImage src={session.user?.image ?? undefined} />
                    <AvatarFallback className="bg-white/20 text-lg font-semibold text-primary-foreground">
                      {(session.user?.name ?? "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold text-primary-foreground">
                      {displayMenuName(session)}
                    </p>
                    <Link
                      href="/settings"
                      onClick={() => setMobileNavOpen(false)}
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/80 px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                      Edit profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-semibold text-primary-foreground">Carmunity</p>
                  <p className="mt-1 text-sm text-primary-foreground/80">
                    Sign in to follow auctions, post, and manage your garage.
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setMobileNavOpen(false)}
                      className="rounded-2xl border border-white/80 px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-white/10"
                    >
                      Log in
                    </Link>
                    <Link
                      href={joinHref}
                      onClick={() => setMobileNavOpen(false)}
                      className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-primary shadow-e1 transition hover:bg-white/90"
                    >
                      Join Carmunity
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <nav className="flex max-h-[calc(100dvh-12rem)] flex-col gap-0.5 overflow-y-auto overscroll-y-contain px-3 py-4 pb-10 touch-pan-y">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                Marketplace
              </p>
              <Link
                href="/auctions"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
              >
                Auctions
              </Link>
              <Link
                href="/sell"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
              >
                List a vehicle
              </Link>
              <p className="mt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                Carmunity
              </p>
              <Link
                href="/explore"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
              >
                Explore feed
              </Link>
              <Link
                href="/discussions"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
              >
                Discussions
              </Link>
              {session?.user ? (
                <>
                  <Link
                    href="/messages"
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
                  >
                    Messages
                  </Link>
                  {handle ? (
                    <>
                      <Link
                        href={`/u/${handle}/garage`}
                        onClick={() => setMobileNavOpen(false)}
                        className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
                      >
                        Garage
                      </Link>
                      <Link
                        href={`/u/${handle}`}
                        onClick={() => setMobileNavOpen(false)}
                        className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
                      >
                        Profile
                      </Link>
                      <Link
                        href={`/u/${handle}/listings`}
                        onClick={() => setMobileNavOpen(false)}
                        className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
                      >
                        My listings
                      </Link>
                    </>
                  ) : null}
                  <Link
                    href="/wallet"
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
                  >
                    Wallet
                  </Link>
                </>
              ) : null}
              <p className="mt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                Learn
              </p>
              <Link
                href="/how-it-works"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
              >
                How Carmunity works
              </Link>
              <Link
                href="/resources/faq"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
              >
                Contact &amp; support
              </Link>
              <p className="mt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                Legal
              </p>
              <Link
                href="/terms"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
              >
                Terms &amp; conditions
              </Link>
              <Link
                href="/privacy"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
              >
                Privacy policy
              </Link>
              <Link
                href="/community-guidelines"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-primary-foreground hover:bg-white/10"
              >
                Community guidelines
              </Link>
            </nav>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-clip bg-background pb-16 text-foreground lg:pb-0">
          {children}
        </main>
      </div>

      <MobileBottomNav />

      <SiteFooter />
    </div>
  );
}
