"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

const marketingNav = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const appNav = [
  { href: "/explore", label: "Carmunity" },
  { href: "/discussions", label: "Discussions" },
  { href: "/auctions", label: "Auctions" },
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
      {/* Sticky glassmorphism header — cyber-luxury */}
      <motion.header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-border/70 bg-background/95 shadow-lg shadow-black/25 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
        initial={false}
        animate={{
          backgroundColor: scrolled
            ? "rgba(7, 8, 12, 0.95)"
            : "rgba(7, 8, 12, 0)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="carasta-container flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
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
            <span className="font-display text-xl font-semibold uppercase tracking-[0.2em] text-neutral-100">
              Carasta
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {marketingNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-medium transition ${
                  pathname === href
                    ? "text-primary"
                    : "text-neutral-400 hover:text-neutral-100"
                }`}
              >
                {label}
              </Link>
            ))}
            {appNav.map(({ href, label }) => {
              const appActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  data-active={appActive ? "true" : "false"}
                  className={`carmunity-nav-link ${
                    appActive
                      ? "font-medium text-primary"
                      : "text-neutral-400 hover:text-neutral-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            {status === "loading" ? (
              <span className="text-neutral-500">…</span>
            ) : session ? (
              <>
                <NotificationDropdown />
                <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 ring-offset-background focus:ring-2 focus:ring-ring">
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage src={session.user?.image ?? undefined} />
                    <AvatarFallback className="bg-neutral-800 text-xs text-neutral-300">
                      {(session.user?.name ?? "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[160px] border-white/10 bg-[#121218]/95 backdrop-blur-xl"
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
              <Link
                href="/auth/sign-in"
                className="font-medium text-neutral-400 transition hover:text-primary"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </motion.header>

      <div className="flex flex-1">
        <AppSidebar />
        <main className="min-w-0 flex-1 bg-background pb-16 text-foreground lg:pb-0">
          {children}
        </main>
      </div>

      <MobileBottomNav />

      {/* Footer — cyber-luxury with neon accent */}
      <footer className="mt-auto">
        <div className="relative border-t border-border/60 bg-background pt-16 pb-24 md:pt-20 md:pb-28">
          <div className="carasta-container">
            <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-between">
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
                <span className="font-display text-2xl font-semibold uppercase tracking-[0.15em] text-neutral-100 md:text-3xl">
                  Carasta
                </span>
              </div>
              <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-neutral-500">Carmunity on mobile</p>
                  <AppStoreBadges />
                  <p className="max-w-xs text-center text-[11px] leading-relaxed text-neutral-600">
                    Same identity and social graph as carasta.com — the site is not a lesser client.
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="font-display text-lg font-semibold text-neutral-200">
                  Contact
                </p>
                <a
                  href="mailto:info@carasta.com"
                  className="text-primary/90 hover:text-primary"
                >
                  info@carasta.com
                </a>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        </div>
        <div className="border-t border-border/60 bg-background py-6">
          <div className="carasta-container flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-neutral-500">
                © {new Date().getFullYear()} Carasta. All rights reserved.
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Carmunity by Carasta — feed, discussions, garage, and auctions
                in one place.
              </p>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm md:justify-end">
              <Link
                href="/terms"
                className="text-neutral-500 transition hover:text-primary"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-neutral-500 transition hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/community-guidelines"
                className="text-neutral-500 transition hover:text-primary"
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
