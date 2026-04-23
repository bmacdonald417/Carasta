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
  Mail,
  CircleHelp,
  ClipboardList,
} from "lucide-react";
import { useHelpPalette } from "@/components/help/HelpPaletteProvider";

const carmunityNav = [
  { href: "/explore", label: "Explore", icon: Users },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
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
  const { openPalette } = useHelpPalette();
  if (!session?.user) return null;
  const handle = (session?.user as { handle?: string } | undefined)?.handle;
  const marketingEnabled = Boolean(
    (session?.user as { marketingEnabled?: boolean } | undefined)?.marketingEnabled
  );

  const garageHref = handle ? `/u/${handle}/garage` : "/auth/sign-in";
  const profileHref = handle ? `/u/${handle}` : "/settings";
  const listingsHref = handle ? `/u/${handle}/listings` : null;
  const marketingHref = handle && marketingEnabled ? `/u/${handle}/marketing` : null;
  const campaignsHref =
    handle && marketingEnabled ? `/u/${handle}/marketing/campaigns` : null;

  const profileActive =
    Boolean(handle) &&
    (pathname === `/u/${handle}` ||
      pathname.startsWith(`/u/${handle}/followers`) ||
      pathname.startsWith(`/u/${handle}/following`));

  const garageActive = pathname.includes("/garage");

  const listingsActive = listingsHref != null && pathname.startsWith(listingsHref);
  const marketingActive =
    marketingHref != null && pathname.startsWith(marketingHref);
  const campaignsActive =
    campaignsHref != null && pathname.startsWith(campaignsHref);

  const sellPathActive =
    pathname.startsWith("/sell") ||
    listingsActive ||
    marketingActive ||
    campaignsActive;

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
        <Link href="/messages">
          <motion.div
            className={cn(
              shellSidebarRowBase,
              pathname.startsWith("/messages") ? shellSidebarActive : shellSidebarInactive
            )}
            whileHover={hoverScale}
            whileTap={tapScale}
          >
            <Mail className="h-5 w-5 shrink-0" />
            Messages
          </motion.div>
        </Link>
        <Link href={profileHref}>
          <motion.div
            className={cn(
              shellSidebarRowBase,
              profileActive ? shellSidebarActive : shellSidebarInactive
            )}
            whileHover={hoverScale}
            whileTap={tapScale}
          >
            <UserRound className="h-5 w-5 shrink-0" />
            Profile
          </motion.div>
        </Link>
        <Link href={garageHref}>
          <motion.div
            className={cn(
              shellSidebarRowBase,
              garageActive ? shellSidebarActive : shellSidebarInactive
            )}
            whileHover={hoverScale}
            whileTap={tapScale}
          >
            <Car className="h-5 w-5 shrink-0" />
            Garage
          </motion.div>
        </Link>

        <div className="my-3 border-t border-border/50" />

        <SectionLabel>Market</SectionLabel>
        <Link href="/auctions">
          <motion.div
            className={cn(
              shellSidebarRowBase,
              pathname.startsWith("/auctions") ? shellSidebarActive : shellSidebarInactive
            )}
            whileHover={hoverScale}
            whileTap={tapScale}
          >
            <Gavel className="h-5 w-5 shrink-0" />
            Live Auctions
          </motion.div>
        </Link>

        <div className="space-y-0.5">
          <Link href="/sell">
            <motion.div
              className={cn(
                shellSidebarRowBase,
                sellPathActive ? shellSidebarActive : shellSidebarInactive
              )}
              whileHover={hoverScale}
              whileTap={tapScale}
            >
              <PlusCircle className="h-5 w-5 shrink-0" />
              Sell
            </motion.div>
          </Link>
          {listingsHref && (
            <Link href={listingsHref}>
              <motion.div
                className={cn(
                  shellSidebarSubRowBase,
                  listingsActive ? shellSidebarSubActive : shellSidebarSubInactive
                )}
                whileHover={hoverScale}
                whileTap={tapScale}
              >
                <ListOrdered className="h-4 w-4 shrink-0 opacity-80" />
                My Listings
              </motion.div>
            </Link>
          )}
          {marketingHref && (
            <Link href={marketingHref}>
              <motion.div
                className={cn(
                  shellSidebarSubRowBase,
                  marketingActive && !campaignsActive
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
          {campaignsHref && (
            <Link href={campaignsHref}>
              <motion.div
                className={cn(
                  shellSidebarSubRowBase,
                  campaignsActive ? shellSidebarSubActive : shellSidebarSubInactive
                )}
                whileHover={hoverScale}
                whileTap={tapScale}
              >
                <ClipboardList className="h-4 w-4 shrink-0 opacity-80" />
                Campaigns
              </motion.div>
            </Link>
          )}
        </div>

        <Link href="/merch">
          <motion.div
            className={cn(
              shellSidebarRowBase,
              pathname.startsWith("/merch") ? shellSidebarActive : shellSidebarInactive
            )}
            whileHover={hoverScale}
            whileTap={tapScale}
          >
            <ShoppingBag className="h-5 w-5 shrink-0" />
            Merch
          </motion.div>
        </Link>

        <div className="my-3 border-t border-border/50" />

        <SectionLabel>Resources</SectionLabel>
        {resourcesNav.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/resources" ? pathname.startsWith("/resources") : pathname === href;
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

        <motion.button
          type="button"
          onClick={() => openPalette()}
          className={cn(
            shellSidebarRowBase,
            shellSidebarInactive,
            "w-full text-left font-normal"
          )}
          whileHover={hoverScale}
          whileTap={tapScale}
        >
          <CircleHelp className="h-5 w-5 shrink-0" />
          <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span>Quick help</span>
            <kbd className="shrink-0 rounded border border-border bg-muted/40 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌃/
            </kbd>
          </span>
        </motion.button>
      </nav>
    </aside>
  );
}
