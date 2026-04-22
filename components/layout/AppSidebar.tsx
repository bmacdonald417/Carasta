"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { hoverScale, tapScale } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  shellSidebarActive,
  shellSidebarInactive,
  shellSidebarRowBase,
  shellSidebarSubActive,
  shellSidebarSubInactive,
  shellSidebarSubRowBase,
} from "@/lib/shell-nav-styles";
import {
  Gavel,
  Users,
  Car,
  ShoppingBag,
  PlusCircle,
  BookOpen,
  UserRound,
  ListOrdered,
  Megaphone,
  MessageSquare,
} from "lucide-react";

const carmunityNav = [
  { href: "/explore", label: "Explore", icon: Users },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/messages", label: "Messages", icon: MessageSquare },
] as const;

const marketNav = [
  { href: "/auctions", label: "Live auctions", icon: Gavel },
  { href: "/sell", label: "Sell", icon: PlusCircle },
] as const;

const resourcesNav = [
  { href: "/how-it-works", label: "How it works", icon: BookOpen },
  { href: "/why-carasta", label: "Why Carasta", icon: BookOpen },
  { href: "/resources", label: "Resources", icon: BookOpen },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
      {children}
    </p>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  if (!session?.user) return null;
  const handle = (session?.user as { handle?: string } | undefined)?.handle;
  const marketingEnabled = Boolean(
    (session?.user as { marketingEnabled?: boolean } | undefined)
      ?.marketingEnabled
  );

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card/50 backdrop-blur-sm lg:block">
      <nav className="sticky top-20 space-y-1 p-4">
        <SectionLabel>Carmunity</SectionLabel>
        {carmunityNav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link key={href} href={href}>
              <motion.div
                className={cn(
                  shellSidebarRowBase,
                  isActive ? shellSidebarActive : shellSidebarInactive
                )}
                whileHover={hoverScale}
                whileTap={tapScale}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </motion.div>
            </Link>
          );
        })}
        {handle ? (
          <Link href={`/u/${handle}`}>
            <motion.div
              className={cn(
                shellSidebarRowBase,
                pathname.startsWith(`/u/${handle}`) ? shellSidebarActive : shellSidebarInactive
              )}
              whileHover={hoverScale}
              whileTap={tapScale}
            >
              <UserRound className="h-5 w-5 shrink-0" />
              Profile
            </motion.div>
          </Link>
        ) : null}

        <div className="my-3 border-t border-border/50" />

        <SectionLabel>Market</SectionLabel>
        {marketNav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          if (href === "/sell") {
            const listingsHref = handle ? `/u/${handle}/listings` : null;
            const marketingHref =
              handle && marketingEnabled ? `/u/${handle}/marketing` : null;
            const listingsActive =
              listingsHref != null && pathname.startsWith(listingsHref);
            const marketingActive =
              marketingHref != null && pathname.startsWith(marketingHref);
            return (
              <div key={href} className="space-y-0.5">
                <Link href={href}>
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      isActive && !listingsActive && !marketingActive
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </motion.div>
                </Link>
                {listingsHref && (
                  <Link href={listingsHref}>
                    <motion.div
                      className={cn(
                        shellSidebarSubRowBase,
                        listingsActive
                          ? shellSidebarSubActive
                          : shellSidebarSubInactive
                      )}
                      whileHover={hoverScale}
                      whileTap={tapScale}
                    >
                      <ListOrdered className="h-4 w-4 shrink-0 opacity-80" />
                      My listings
                    </motion.div>
                  </Link>
                )}
                {marketingHref && (
                  <Link href={marketingHref}>
                    <motion.div
                      className={cn(
                        shellSidebarSubRowBase,
                        marketingActive
                          ? shellSidebarSubActive
                          : shellSidebarSubInactive
                      )}
                      whileHover={hoverScale}
                      whileTap={tapScale}
                    >
                      <Megaphone className="h-4 w-4 shrink-0 opacity-80" />
                      Marketing
                    </motion.div>
                  </Link>
                )}
              </div>
            );
          }
          return (
            <Link key={href} href={href}>
              <motion.div
                className={cn(
                  shellSidebarRowBase,
                  isActive ? shellSidebarActive : shellSidebarInactive
                )}
                whileHover={hoverScale}
                whileTap={tapScale}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </motion.div>
            </Link>
          );
        })}

        <div className="my-3 border-t border-border/50" />

        <SectionLabel>Resources</SectionLabel>
        {resourcesNav.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/resources" ? pathname.startsWith("/resources") : pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                className={cn(
                  shellSidebarRowBase,
                  isActive ? shellSidebarActive : shellSidebarInactive
                )}
                whileHover={hoverScale}
                whileTap={tapScale}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </motion.div>
            </Link>
          );
        })}

        <div className="my-4 border-t border-border/50" />
        <Link
          href={
            session?.user
              ? `/u/${(session.user as any)?.handle}/garage`
              : "/auth/sign-in"
          }
        >
          <motion.div
            className={cn(
              shellSidebarRowBase,
              pathname.includes("/garage")
                ? shellSidebarActive
                : shellSidebarInactive
            )}
            whileHover={hoverScale}
            whileTap={tapScale}
          >
            <Car className="h-5 w-5 shrink-0" />
            Garage
          </motion.div>
        </Link>
        <Link href="/merch">
          <motion.div
            className={cn(
              shellSidebarRowBase,
              pathname.startsWith("/merch")
                ? shellSidebarActive
                : shellSidebarInactive
            )}
            whileHover={hoverScale}
            whileTap={tapScale}
          >
            <ShoppingBag className="h-5 w-5 shrink-0" />
            Merch Store
          </motion.div>
        </Link>
      </nav>
    </aside>
  );
}
