"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { hoverScale, tapScale } from "@/lib/motion";
import { cn } from "@/lib/utils";
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
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useHelpPalette } from "@/components/help/HelpPaletteProvider";
import {
  campaignsNavHref,
  garageNavHref,
  listingsNavHref,
  marketingNavHref,
  normalizePublicHandle,
  profileNavActive,
  profileNavHref,
} from "@/lib/profile-nav";

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
    <Link href={href} title={label}>
      <motion.div
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
          collapsed && "justify-center px-0 gap-0",
          active
            ? "bg-white/15 text-white shadow-sm"
            : "text-white/65 hover:bg-white/8 hover:text-white"
        )}
        whileHover={hoverScale}
        whileTap={tapScale}
      >
        <Icon
          className={cn(
            "shrink-0 transition-all",
            collapsed ? "h-5 w-5" : "h-4 w-4",
            active ? "text-white" : "text-white/60"
          )}
          aria-hidden
        />
        {!collapsed && <span className="truncate">{label}</span>}
        {!collapsed && active && (
          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
        )}
      </motion.div>
    </Link>
  );
}

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) return <div className="my-1 mx-3 h-px bg-white/10" />;
  return (
    <p className="mb-1.5 mt-0.5 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
      {children}
    </p>
  );
}

function JumperRow({ href, label, collapsed }: { href: string; label: string; collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <Link href={href} className="block">
      <motion.div
        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/45 transition hover:bg-white/8 hover:text-white/80"
        whileHover={hoverScale}
        whileTap={tapScale}
      >
        <span>{label}</span>
        <ArrowUpRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
      </motion.div>
    </Link>
  );
}

const STORAGE_KEY = "carasta-sidebar-collapsed";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openPalette } = useHelpPalette();

  // Default state: collapsed
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Default to collapsed (true) unless explicitly set to "false"
      return stored === null ? true : stored === "true";
    }
    return true;
  });

  if (!session?.user) return null;

  const sessionHandle = (session?.user as { handle?: string } | undefined)?.handle;
  const handle = normalizePublicHandle(sessionHandle);
  const marketingEnabled = Boolean(
    (session?.user as { marketingEnabled?: boolean } | undefined)?.marketingEnabled
  );

  const pillar = getActivePillar(pathname, handle ?? null);

  const profileHref = profileNavHref(sessionHandle);
  const garageHref = garageNavHref(sessionHandle);
  const listingsHref = listingsNavHref(sessionHandle);
  const marketingHref =
    handle && marketingEnabled ? marketingNavHref(sessionHandle) : null;
  const campaignsHref =
    handle && marketingEnabled ? campaignsNavHref(sessionHandle) : null;

  const profileActive = profileNavActive(pathname, sessionHandle);

  const garageActive = pathname.includes("/garage");
  const listingsActive = listingsHref != null && pathname.startsWith(listingsHref);
  const marketingActive =
    marketingHref != null &&
    pathname.startsWith(marketingHref) &&
    !pathname.includes("/campaigns");
  const campaignsActive =
    campaignsHref != null && pathname.includes("/marketing/campaigns");

  function toggle() {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  const pillarLabel =
    pillar === "carmunity" ? "Carmunity" : pillar === "market" ? "Market" : "Resources";

  const jumpers =
    pillar === "carmunity" ? (
      <>
        <JumperRow href="/auctions" label="Market" collapsed={isCollapsed} />
        <JumperRow href="/resources" label="Resources" collapsed={isCollapsed} />
      </>
    ) : pillar === "market" ? (
      <>
        <JumperRow href="/explore" label="Carmunity" collapsed={isCollapsed} />
        <JumperRow href="/resources" label="Resources" collapsed={isCollapsed} />
      </>
    ) : (
      <>
        <JumperRow href="/explore" label="Carmunity" collapsed={isCollapsed} />
        <JumperRow href="/auctions" label="Market" collapsed={isCollapsed} />
      </>
    );

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col",
        "lg:sticky lg:top-[3.75rem] lg:flex lg:h-[calc(100dvh-3.75rem)]",
        "transition-[width] duration-200 ease-in-out",
        "bg-[hsl(var(--navy))]",
        isCollapsed ? "w-[3.5rem]" : "w-56"
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Brand strip + collapse toggle */}
        <div
          className={cn(
            "flex shrink-0 items-center border-b border-white/8 px-2 py-3",
            isCollapsed ? "justify-center" : "justify-between px-3"
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <img
                src="/brand/carasta/logo-circle.png"
                alt="Carasta"
                className="h-6 w-6 shrink-0 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="truncate text-xs font-bold tracking-[0.16em] uppercase text-white/80">
                Carmunity
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                !isCollapsed && "rotate-180"
              )}
              aria-hidden
            />
          </button>
        </div>

        {/* Nav items */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          <SectionLabel collapsed={isCollapsed}>{pillarLabel}</SectionLabel>
          <div className="space-y-0.5">
            {pillar === "carmunity" && (
              <>
                <NavItem href="/explore" icon={Users} label="Explore" active={pathname.startsWith("/explore")} collapsed={isCollapsed} />
                <NavItem href="/discussions" icon={MessageSquare} label="Discussions" active={pathname.startsWith("/discussions")} collapsed={isCollapsed} />
                <NavItem href="/messages" icon={Mail} label="Messages" active={pathname.startsWith("/messages")} collapsed={isCollapsed} />
                <NavItem href={profileHref} icon={UserRound} label="Profile" active={profileActive} collapsed={isCollapsed} />
                <NavItem href={garageHref} icon={Car} label="Garage" active={garageActive} collapsed={isCollapsed} />
              </>
            )}
            {pillar === "market" && (
              <>
                <NavItem href={profileHref} icon={UserRound} label="Profile" active={profileActive} collapsed={isCollapsed} />
                <NavItem href={garageHref} icon={Car} label="Garage" active={garageActive} collapsed={isCollapsed} />
                <NavItem href="/explore" icon={Users} label="Explore" active={pathname.startsWith("/explore")} collapsed={isCollapsed} />
                <NavItem href="/messages" icon={Mail} label="Messages" active={pathname.startsWith("/messages")} collapsed={isCollapsed} />
                <NavItem href="/auctions" icon={Gavel} label="Live Auctions" active={pathname.startsWith("/auctions")} collapsed={isCollapsed} />
                <NavItem href="/sell" icon={PlusCircle} label="Sell" active={pathname.startsWith("/sell")} collapsed={isCollapsed} />
                {listingsHref && <NavItem href={listingsHref} icon={ListOrdered} label="My Listings" active={listingsActive} collapsed={isCollapsed} />}
                {marketingHref && <NavItem href={marketingHref} icon={Megaphone} label="Marketing" active={marketingActive} collapsed={isCollapsed} />}
                {campaignsHref && <NavItem href={campaignsHref} icon={ClipboardList} label="Campaigns" active={campaignsActive} collapsed={isCollapsed} />}
                <NavItem href="/merch" icon={ShoppingBag} label="Merch" active={pathname.startsWith("/merch")} collapsed={isCollapsed} />
                <NavItem href="/wallet" icon={Wallet} label="Wallet" active={pathname.startsWith("/wallet")} collapsed={isCollapsed} />
              </>
            )}
            {pillar === "resources" && (
              <>
                <NavItem href={profileHref} icon={UserRound} label="Profile" active={profileActive} collapsed={isCollapsed} />
                <NavItem href={garageHref} icon={Car} label="Garage" active={garageActive} collapsed={isCollapsed} />
                <NavItem href="/explore" icon={Users} label="Explore" active={pathname.startsWith("/explore")} collapsed={isCollapsed} />
                <NavItem href="/messages" icon={Mail} label="Messages" active={pathname.startsWith("/messages")} collapsed={isCollapsed} />
                <NavItem href="/resources" icon={BookOpen} label="Resources" active={pathname === "/resources"} collapsed={isCollapsed} />
                <NavItem href="/how-it-works" icon={BookOpen} label="How It Works" active={pathname === "/how-it-works"} collapsed={isCollapsed} />
                <NavItem href="/why-carasta" icon={BookOpen} label="Why Carasta" active={pathname === "/why-carasta"} collapsed={isCollapsed} />
                <NavItem href="/resources/faq" icon={BookOpen} label="FAQ" active={pathname.startsWith("/resources/faq")} collapsed={isCollapsed} />
                <NavItem href="/resources/trust-and-safety" icon={BookOpen} label="Trust & Safety" active={pathname.startsWith("/resources/trust-and-safety")} collapsed={isCollapsed} />
                <NavItem href="/contact" icon={BookOpen} label="Contact" active={pathname === "/contact" || pathname.startsWith("/contact/")} collapsed={isCollapsed} />
              </>
            )}
          </div>

          {/* Cross-pillar jump links */}
          {!isCollapsed && (
            <div className="mt-4 border-t border-white/8 pt-3">
              <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                More
              </p>
              <div className="space-y-0.5">{jumpers}</div>
            </div>
          )}
        </div>

        {/* Footer — quick help */}
        {!isCollapsed && (
          <div className="shrink-0 border-t border-white/8 px-3 py-3">
            <button
              type="button"
              onClick={() => openPalette()}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-white/40 transition hover:bg-white/8 hover:text-white/80"
            >
              <span className="truncate">Quick help</span>
              <kbd className="ml-auto shrink-0 rounded border border-white/15 bg-white/5 px-1 py-0.5 font-mono text-[9px] text-white/30">
                ⌃/
              </kbd>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
