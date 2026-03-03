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
    pathname === "/how-it-works" ||
    pathname === "/contact" ||
    pathname === "/terms" ||
    pathname === "/privacy";

  return (
    <div className="carasta-theme flex min-h-screen flex-col bg-[#0a0a0f]">
      {/* Sticky glassmorphism header — cyber-luxury */}
      <motion.header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-[#0a0a0f]/95 shadow-lg shadow-black/20 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
        initial={false}
        animate={{
          backgroundColor: scrolled
            ? "rgba(10, 10, 15, 0.95)"
            : "rgba(10, 10, 15, 0)",
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
                    ? "text-[#ff3b5c]"
                    : "text-neutral-400 hover:text-neutral-100"
                }`}
              >
                {label}
              </Link>
            ))}
            {appNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-neutral-400 transition hover:text-neutral-100"
              >
                {label}
              </Link>
            ))}
            {status === "loading" ? (
              <span className="text-neutral-500">…</span>
            ) : session ? (
              <>
                <NotificationDropdown />
                <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 ring-offset-[#0a0a0f] focus:ring-2 focus:ring-[#ff3b5c]">
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
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  {(session.user as any)?.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
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
                className="font-medium text-neutral-400 transition hover:text-[#ff3b5c]"
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
              ? "bg-[#0a0a0f] text-neutral-100"
              : "bg-background text-foreground"
          }`}
        >
          {children}
        </main>
      </div>

      <MobileBottomNav />

      {/* Footer — cyber-luxury with neon accent */}
      <footer className="mt-auto">
        <div className="relative border-t border-white/10 bg-[#0a0a0f] pt-16 pb-24 md:pt-20 md:pb-28">
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
                  <p className="text-xs text-neutral-500">Download the app</p>
                  <AppStoreBadges />
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="font-display text-lg font-semibold text-neutral-200">
                  Contact
                </p>
                <a
                  href="mailto:info@carasta.com"
                  className="text-[#ff3b5c]/90 hover:text-[#ff3b5c]"
                >
                  info@carasta.com
                </a>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff3b5c]/20 to-transparent" />
        </div>
        <div className="border-t border-white/10 bg-[#0a0a0f] py-6">
          <div className="carasta-container flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Carasta. All rights reserved.
            </p>
            <nav className="flex gap-6 text-sm">
              <Link
                href="/terms"
                className="text-neutral-500 transition hover:text-[#ff3b5c]"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-neutral-500 transition hover:text-[#ff3b5c]"
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
