"use client";

import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
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

function SectionLabel({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed: boolean;
}) {
  if (collapsed) return null;
  return (
    <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
      {children}
    </p>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link href={href} title={collapsed ? label : undefined}>
      <motion.div
        className={cn(
          shellSidebarRowBase,
          active ? shellSidebarActive : shellSidebarInactive,
          collapsed && "justify-center px-2 gap-0"
        )}
        whileHover={hoverScale}
        whileTap={tapScale}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
        {!collapsed && <span>{label}</span>}
      </motion.div>
    </Link>
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

const STORAGE_KEY = "carasta-sidebar-collapsed";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openPalette } = useHelpPalette();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });

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

  function toggle() {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-card/80 backdrop-blur-sm",
        "lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-5rem)] lg:max-h-[calc(100dvh-5rem)]",
        "transition-[width] duration-200 ease-in-out",
        isCollapsed ? "w-14" : "w-56"
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Collapse toggle */}
        <div
          className={cn(
            "flex shrink-0 border-b border-border/40 px-2 py-2",
            isCollapsed ? "justify-center" : "justify-end"
          )}
        >
          <button
            type="button"
            onClick={toggle}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2 pt-3">
          <SectionLabel collapsed={isCollapsed}>{pillarTitle}</SectionLabel>
          <div className="space-y-0.5">
            {pillar === "carmunity" ? (
              <>
                <NavItem
                  href="/explore"
                  icon={Users}
                  label="Explore"
                  active={pathname.startsWith("/explore")}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/discussions"
                  icon={MessageSquare}
                  label="Discussions"
                  active={pathname.startsWith("/discussions")}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/messages"
                  icon={Mail}
                  label="Messages"
                  active={pathname.startsWith("/messages")}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href={profileHref}
                  icon={UserRound}
                  label="Profile"
                  active={profileActive}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href={garageHref}
                  icon={Car}
                  label="Garage"
                  active={garageActive}
                  collapsed={isCollapsed}
                />
              </>
            ) : null}

            {pillar === "market" ? (
              <>
                <NavItem
                  href="/auctions"
                  icon={Gavel}
                  label="Live Auctions"
                  active={pathname.startsWith("/auctions")}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/sell"
                  icon={PlusCircle}
                  label="Sell"
                  active={pathname.startsWith("/sell")}
                  collapsed={isCollapsed}
                />
                {listingsHref ? (
                  <NavItem
                    href={listingsHref}
                    icon={ListOrdered}
                    label="My Listings"
                    active={listingsActive}
                    collapsed={isCollapsed}
                  />
                ) : null}
                {marketingHref ? (
                  <NavItem
                    href={marketingHref}
                    icon={Megaphone}
                    label="Marketing"
                    active={marketingActive}
                    collapsed={isCollapsed}
                  />
                ) : null}
                {campaignsHref ? (
                  <NavItem
                    href={campaignsHref}
                    icon={ClipboardList}
                    label="Campaigns"
                    active={campaignsActive}
                    collapsed={isCollapsed}
                  />
                ) : null}
                <NavItem
                  href="/merch"
                  icon={ShoppingBag}
                  label="Merch"
                  active={pathname.startsWith("/merch")}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/wallet"
                  icon={Wallet}
                  label="Wallet"
                  active={pathname.startsWith("/wallet")}
                  collapsed={isCollapsed}
                />
              </>
            ) : null}

            {pillar === "resources" ? (
              <>
                <NavItem
                  href="/resources"
                  icon={BookOpen}
                  label="Resources hub"
                  active={pathname === "/resources"}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/how-it-works"
                  icon={BookOpen}
                  label="How It Works"
                  active={pathname === "/how-it-works"}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/why-carasta"
                  icon={BookOpen}
                  label="Why Carasta"
                  active={pathname === "/why-carasta"}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/resources/faq"
                  icon={BookOpen}
                  label="FAQ"
                  active={pathname.startsWith("/resources/faq")}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/resources/glossary"
                  icon={BookOpen}
                  label="Glossary"
                  active={pathname.startsWith("/resources/glossary")}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/resources/trust-and-safety"
                  icon={BookOpen}
                  label="Trust & Safety"
                  active={pathname.startsWith("/resources/trust-and-safety")}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/contact"
                  icon={BookOpen}
                  label="Contact"
                  active={pathname === "/contact" || pathname.startsWith("/contact/")}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/community-guidelines"
                  icon={BookOpen}
                  label="Community guidelines"
                  active={pathname === "/community-guidelines"}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/terms"
                  icon={BookOpen}
                  label="Terms"
                  active={pathname === "/terms"}
                  collapsed={isCollapsed}
                />
                <NavItem
                  href="/privacy"
                  icon={BookOpen}
                  label="Privacy"
                  active={pathname === "/privacy"}
                  collapsed={isCollapsed}
                />
              </>
            ) : null}
          </div>
        </div>

        {!isCollapsed && (
          <>
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
          </>
        )}
      </div>
    </aside>
  );
}
