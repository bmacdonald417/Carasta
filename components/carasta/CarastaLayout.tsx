"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const marketingNav = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const appNav = [
  { href: "/auctions", label: "Auctions" },
  { href: "/explore", label: "Community" },
  { href: "/sell", label: "Sell" },
];

export function CarastaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [logoError, setLogoError] = useState(false);

  const isMarketing =
    pathname === "/" ||
    pathname === "/contact" ||
    pathname === "/terms" ||
    pathname === "/privacy";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header — minimal, lots of whitespace */}
      <header className="border-b border-carasta-border bg-carasta-bg/95 text-carasta-ink">
        <div className="carasta-container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {!logoError ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                src="/brand/carasta/logo-circle.png"
                alt="Carasta"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
                onError={() => setLogoError(true)}
              />
              </>
            ) : null}
            <span className="font-serif text-xl font-semibold tracking-tight text-carasta-ink">
              CARASTA
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {marketingNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-medium ${
                  pathname === href
                    ? "text-carasta-ink"
                    : "text-carasta-muted hover:text-carasta-ink"
                }`}
              >
                {label}
              </Link>
            ))}
            {appNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-carasta-muted hover:text-carasta-ink"
              >
                {label}
              </Link>
            ))}
            {status === "loading" ? (
              <span className="text-carasta-muted">…</span>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 ring-offset-carasta-bg focus:ring-2 focus:ring-carasta-ink">
                  <Avatar className="h-8 w-8 border border-carasta-border">
                    <AvatarImage src={session.user?.image ?? undefined} />
                    <AvatarFallback className="bg-carasta-card text-carasta-ink text-xs">
                      {(session.user?.name ?? "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        (session.user as any)?.handle
                          ? `/u/${(session.user as any).handle}`
                          : "/settings"
                      }
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/api/auth/signout">Sign out</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/sign-in"
                className="font-medium text-carasta-muted hover:text-carasta-ink"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main
        className={
          isMarketing
            ? "flex-1 bg-carasta-bg font-serif text-carasta-ink"
            : "flex-1 bg-background text-foreground font-sans"
        }
      >
        {children}
      </main>

      {/* Footer — red section + black wave + copyright row */}
      <footer className="mt-auto">
        <div className="relative bg-carasta-red pt-16 pb-24 text-carasta-white md:pt-20 md:pb-28">
          <div className="carasta-container">
            <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                <span className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
                  CARASTA
                </span>
              </div>
              <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/carasta/appstore-badge.png"
                    alt="Download on the App Store"
                    width={140}
                    height={46}
                    className="h-10 object-contain md:h-11"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/carasta/googleplay-badge.png"
                    alt="Get it on Google Play"
                    width={160}
                    height={46}
                    className="h-10 object-contain md:h-11"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </a>
              </div>
              <div className="text-center md:text-right">
                <p className="font-serif text-lg font-semibold">Contact</p>
                <a
                  href="mailto:info@carasta.com"
                  className="text-carasta-white/95 hover:underline"
                >
                  info@carasta.com
                </a>
              </div>
            </div>
          </div>
          {/* Black curved/angled accent at bottom of red */}
          <div className="absolute bottom-0 left-0 right-0 h-12 w-full overflow-hidden md:h-16">
            <svg
              viewBox="0 0 1440 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute bottom-0 h-full w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0 64V0l120 16 120-16 120 16 120-16 120 16 120-16 120 16 120-16 120 16 120-16 120 16 120-16 120 16 120-16V64H0z"
                fill="#0b0b0b"
              />
            </svg>
          </div>
        </div>
        <div className="bg-carasta-bg border-t border-carasta-border py-6">
          <div className="carasta-container flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
            <p className="text-sm text-carasta-muted">
              © {new Date().getFullYear()} Carasta. All rights reserved.
            </p>
            <nav className="flex gap-6 text-sm">
              <Link
                href="/terms"
                className="text-carasta-muted hover:text-carasta-ink"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-carasta-muted hover:text-carasta-ink"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
