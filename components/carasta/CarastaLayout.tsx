"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isMarketing =
    pathname === "/" ||
    pathname === "/contact" ||
    pathname === "/terms" ||
    pathname === "/privacy";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Sticky glassmorphism header — transparent when at top, solid when scrolled */}
      <motion.header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-neutral-200/80 bg-white/95 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0)",
          backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="carasta-container flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="flex items-center gap-3">
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
            <span className="font-display text-xl font-semibold tracking-tight text-neutral-900">
              CARASTA
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {marketingNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-medium transition ${
                  pathname === href
                    ? "text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {label}
              </Link>
            ))}
            {appNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-neutral-500 transition hover:text-neutral-900"
              >
                {label}
              </Link>
            ))}
            {status === "loading" ? (
              <span className="text-neutral-400">…</span>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 ring-offset-white focus:ring-2 focus:ring-neutral-900">
                  <Avatar className="h-8 w-8 border border-neutral-200">
                    <AvatarImage src={session.user?.image ?? undefined} />
                    <AvatarFallback className="bg-neutral-100 text-neutral-700 text-xs">
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
                className="font-medium text-neutral-600 transition hover:text-neutral-900"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </motion.header>

      <div className="flex flex-1">
        <AppSidebar />
        <main
          className={`min-w-0 flex-1 pb-16 lg:pb-0 ${
            isMarketing
              ? "bg-white text-neutral-900"
              : "bg-background text-foreground"
          }`}
        >
          {children}
        </main>
      </div>

      <MobileBottomNav />

      {/* Footer — brand red + black wave */}
      <footer className="mt-auto">
        <div className="relative bg-[#a41515] pt-16 pb-24 text-white md:pt-20 md:pb-28">
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
                <span className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
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
                <p className="font-display text-lg font-semibold">Contact</p>
                <a
                  href="mailto:info@carasta.com"
                  className="text-white/95 hover:underline"
                >
                  info@carasta.com
                </a>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 w-full overflow-hidden md:h-16">
            <svg
              viewBox="0 0 1440 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute bottom-0 h-full w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0 64V0l120 16 120-16 120 16 120-16 120 16 120-16 120 16 120-16 120 16 120-16 120 16 120-16 120 16 120-16 120 16 120-16V64H0z"
                fill="#0b0b0b"
              />
            </svg>
          </div>
        </div>
        <div className="border-t border-neutral-200 bg-white py-6">
          <div className="carasta-container flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Carasta. All rights reserved.
            </p>
            <nav className="flex gap-6 text-sm">
              <Link href="/terms" className="text-neutral-500 hover:text-neutral-900">
                Terms &amp; Conditions
              </Link>
              <Link href="/privacy" className="text-neutral-500 hover:text-neutral-900">
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
