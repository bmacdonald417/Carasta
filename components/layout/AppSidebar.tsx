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
  ClipboardList,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { useHelpPalette } from "@/components/help/HelpPaletteProvider";

type Pillar = "carmunity" | "market" | "resources";

function getActivePillar(pathname: string, handle?: string | null): Pillar {
  if (
    pathname.startsWith("/resources") ||
    pathname === "/how-it-works" ||
    pathname === "/why-carasta" ||
    pathname === "/contact" ||
    pathname.startsWith("/contact/") ||
    pathname === "/community-guidelines" ||
    pathname === "/terms" ||
    pathname === "/privacy"
  ) {
    return "resources";
  }
  if (
    pathname.startsWith("/auctions") ||
    pathname.startsWith("/sell") ||
    pathname.startsWith("/merch") ||
    pathname.startsWith("/wallet")
  ) {
    return "market";
  }
  if (handle) {
    if (
      pathname.startsWith(`/u/${handle}/listings`) ||
      pathname.startsWith(`/u/${handle}/marketing`)
    ) {
      return "market";
    }
  }
  return "carmunity";
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
      {children}
    </p>
  );
}

function JumperRow({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link href={href} className="block">
      <motion.div
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        )}
        whileHover={hoverScale}
        whileTap={tapScale}
      >
        <span>{label}</span>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
      </motion.div>
    </Link>
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

  const pillar = getActivePillar(pathname, handle ?? null);

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
    marketingHref != null &&
    pathname.startsWith(marketingHref) &&
    !pathname.includes("/campaigns");
  const campaignsActive =
    campaignsHref != null && pathname.includes("/marketing/campaigns");

  const jumpers =
    pillar === "carmunity" ? (
      <>
        <JumperRow href="/auctions" label="Market" />
        <JumperRow href="/resources" label="Resources" />
      </>
    ) : pillar === "market" ? (
      <>
        <JumperRow href="/explore" label="Carmunity" />
        <JumperRow href="/resources" label="Resources" />
      </>
    ) : (
      <>
        <JumperRow href="/explore" label="Carmunity" />
        <JumperRow href="/auctions" label="Market" />
      </>
    );

  const pillarTitle =
    pillar === "carmunity" ? "Carmunity" : pillar === "market" ? "Market" : "Resources";

  return (
    <aside
      className={cn(
        "hidden w-56 shrink-0 flex-col border-r border-border bg-card/50 backdrop-blur-sm",
        "lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-5rem)] lg:max-h-[calc(100dvh-5rem)]"
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-2 pt-4">
          <SectionLabel>{pillarTitle}</SectionLabel>
          <div className="space-y-0.5">
            {pillar === "carmunity" ? (
              <>
                <Link href="/explore">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname.startsWith("/explore")
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <Users className="h-5 w-5 shrink-0" />
                    Explore
                  </motion.div>
                </Link>
                <Link href="/discussions">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname.startsWith("/discussions")
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <MessageSquare className="h-5 w-5 shrink-0" />
                    Discussions
                  </motion.div>
                </Link>
                <Link href="/messages">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname.startsWith("/messages")
                        ? shellSidebarActive
                        : shellSidebarInactive
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
              </>
            ) : null}

            {pillar === "market" ? (
              <>
                <Link href="/auctions">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname.startsWith("/auctions")
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <Gavel className="h-5 w-5 shrink-0" />
                    Live Auctions
                  </motion.div>
                </Link>
                <Link href="/sell">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname.startsWith("/sell")
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <PlusCircle className="h-5 w-5 shrink-0" />
                    Sell
                  </motion.div>
                </Link>
                {listingsHref ? (
                  <Link href={listingsHref}>
                    <motion.div
                      className={cn(
                        shellSidebarRowBase,
                        listingsActive ? shellSidebarActive : shellSidebarInactive
                      )}
                      whileHover={hoverScale}
                      whileTap={tapScale}
                    >
                      <ListOrdered className="h-5 w-5 shrink-0" />
                      My Listings
                    </motion.div>
                  </Link>
                ) : null}
                {marketingHref ? (
                  <Link href={marketingHref}>
                    <motion.div
                      className={cn(
                        shellSidebarRowBase,
                        marketingActive ? shellSidebarActive : shellSidebarInactive
                      )}
                      whileHover={hoverScale}
                      whileTap={tapScale}
                    >
                      <Megaphone className="h-5 w-5 shrink-0" />
                      Marketing
                    </motion.div>
                  </Link>
                ) : null}
                {campaignsHref ? (
                  <Link href={campaignsHref}>
                    <motion.div
                      className={cn(
                        shellSidebarRowBase,
                        campaignsActive ? shellSidebarActive : shellSidebarInactive
                      )}
                      whileHover={hoverScale}
                      whileTap={tapScale}
                    >
                      <ClipboardList className="h-5 w-5 shrink-0" />
                      Campaigns
                    </motion.div>
                  </Link>
                ) : null}
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
                    Merch
                  </motion.div>
                </Link>
                <Link href="/wallet">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname.startsWith("/wallet")
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <Wallet className="h-5 w-5 shrink-0" />
                    Wallet
                  </motion.div>
                </Link>
              </>
            ) : null}

            {pillar === "resources" ? (
              <>
                <Link href="/resources">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname === "/resources" ? shellSidebarActive : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" />
                    Resources hub
                  </motion.div>
                </Link>
                <Link href="/how-it-works">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname === "/how-it-works"
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" />
                    How It Works
                  </motion.div>
                </Link>
                <Link href="/why-carasta">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname === "/why-carasta"
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" />
                    Why Carasta
                  </motion.div>
                </Link>
                <Link href="/resources/faq">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname.startsWith("/resources/faq")
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" />
                    FAQ
                  </motion.div>
                </Link>
                <Link href="/resources/glossary">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname.startsWith("/resources/glossary")
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" />
                    Glossary
                  </motion.div>
                </Link>
                <Link href="/resources/trust-and-safety">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname.startsWith("/resources/trust-and-safety")
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" />
                    Trust &amp; Safety
                  </motion.div>
                </Link>
                <Link href="/contact">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname === "/contact" || pathname.startsWith("/contact/")
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" />
                    Contact
                  </motion.div>
                </Link>
                <Link href="/community-guidelines">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname === "/community-guidelines"
                        ? shellSidebarActive
                        : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" />
                    Community guidelines
                  </motion.div>
                </Link>
                <Link href="/terms">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname === "/terms" ? shellSidebarActive : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" />
                    Terms
                  </motion.div>
                </Link>
                <Link href="/privacy">
                  <motion.div
                    className={cn(
                      shellSidebarRowBase,
                      pathname === "/privacy" ? shellSidebarActive : shellSidebarInactive
                    )}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <BookOpen className="h-5 w-5 shrink-0" />
                    Privacy
                  </motion.div>
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t border-border/50 px-3 py-2">
          <button
            type="button"
            onClick={() => openPalette()}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <span className="truncate">Quick help</span>
            <kbd className="ml-auto shrink-0 rounded border border-border/80 bg-muted/30 px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌃/
            </kbd>
          </button>
        </div>

        <div className="shrink-0 border-t border-border/60 bg-muted/20 px-3 py-3">
          <p className="px-2 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
            More
          </p>
          <div className="space-y-0.5">{jumpers}</div>
        </div>
      </div>
    </aside>
  );
}
