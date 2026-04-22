"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import {
  shellHeaderAppActive,
  shellHeaderAppInactive,
  shellHeaderAppLinkBase,
  shellHeaderMarketingActive,
  shellHeaderMarketingInactive,
  shellHeaderMarketingLinkBase,
} from "@/lib/shell-nav-styles";

const marketingNav = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/why-carasta", label: "Why Carasta" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

const signedInTopNav = [
  { href: "/explore", label: "Carmunity" },
  { href: "/auctions", label: "Market" },
  { href: "/resources", label: "Resources" },
];

const publicTopNav = [
  { href: "/explore", label: "Carmunity (Preview)" },
  { href: "/auctions", label: "Market (Browse)" },
  { href: "/resources", label: "Resources" },
];

const footerProductLinks = [
  { href: "/explore", label: "Carmunity" },
  { href: "/discussions", label: "Discussions" },
  { href: "/auctions", label: "Market" },
  { href: "/sell", label: "Sell" },
];

export function CarastaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [logoError, setLogoError] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
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
          <div className="hidden min-w-0 flex-1 items-center justify-between gap-4 lg:flex">
            {!session ? (
              <nav className="flex min-w-0 items-center gap-1">
                {marketingNav.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      shellHeaderMarketingLinkBase,
                      pathname === href
                        ? shellHeaderMarketingActive
                        : shellHeaderMarketingInactive
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            ) : (
              <div />
            )}
            <nav className="flex items-center gap-1">
              {(session ? signedInTopNav : publicTopNav).map(({ href, label }) => {
                const appActive = href === "/resources" ? pathname.startsWith("/resources") : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    data-active={appActive ? "true" : "false"}
                    className={cn(
                      shellHeaderAppLinkBase,
                      appActive ? shellHeaderAppActive : shellHeaderAppInactive
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <nav className="ml-auto flex items-center gap-3 text-sm">
            {status === "loading" ? (
              <span className="text-muted-foreground">…</span>
            ) : session ? (
              <>
                <Link
                  href="/messages"
                  data-active={pathname.startsWith("/messages") ? "true" : "false"}
                  className={cn(
                    "hidden xl:inline-flex",
                    shellHeaderAppLinkBase,
                    pathname.startsWith("/messages")
                      ? shellHeaderAppActive
                      : shellHeaderAppInactive
                  )}
                >
                  Messages
                </Link>
                <NotificationDropdown />
                <DropdownMenu>
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
                    className="min-w-[180px] border border-border bg-popover text-popover-foreground shadow-e2 backdrop-blur-xl"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          (session.user as any)?.handle
                            ? `/u/${(session.user as any).handle}`
                            : "/settings"
                        }
                      >
                        You
                      </Link>
                    </DropdownMenuItem>
                    {(session.user as any)?.handle && (
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/u/${(session.user as any).handle}/listings`}
                        >
                          My listings
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {session.user?.handle && session.user.marketingEnabled && (
                      <DropdownMenuItem asChild>
                        <Link href={`/u/${session.user.handle}/marketing`}>
                          Marketing dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    {(session.user as any)?.role === "ADMIN" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/feedback">
                            Element feedback
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/marketing">
                            Seller marketing (review)
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/api/auth/signout">Sign out</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  href="/auctions"
                  className="hidden font-medium text-muted-foreground transition hover:text-foreground md:inline-flex"
                >
                  Browse Market
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="font-medium text-muted-foreground transition hover:text-primary"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up?callbackUrl=%2Fwelcome%3Fnext%3D%252Fexplore"
                  className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 md:inline-flex"
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
                    href="/auth/sign-up?callbackUrl=%2Fwelcome%3Fnext%3D%252Fexplore"
                    className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Join Carmunity
                  </Link>
                  <Link
                    href="/auctions"
                    className="rounded-full border border-border px-4 py-2 font-semibold text-foreground transition hover:bg-muted/60"
                  >
                    Browse Market
                  </Link>
                </div>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-1">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    Explore
                  </p>
                  <nav className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
                    {marketingNav.map(({ href, label }) => (
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
