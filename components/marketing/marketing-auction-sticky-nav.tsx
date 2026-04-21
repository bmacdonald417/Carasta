"use client";

const LINKS = [
  { href: "#marketing-overview", label: "Overview" },
  { href: "#marketing-alerts", label: "Alerts" },
  { href: "#marketing-ai-copilot", label: "AI copilot" },
  { href: "#marketing-workspace", label: "Workspace" },
  { href: "#marketing-share-promote", label: "Share & Promote" },
  { href: "#marketing-carmunity", label: "Carmunity" },
  { href: "#marketing-promo-posts", label: "Promo posts" },
  { href: "#marketing-campaigns", label: "Campaigns" },
  { href: "#marketing-analytics", label: "Analytics" },
  { href: "#marketing-activity", label: "Activity" },
] as const;

/**
 * Horizontal jump links for long per-listing marketing pages.
 */
export function MarketingAuctionStickyNav() {
  return (
    <nav
      aria-label="On this page"
      className="sticky top-16 z-30 mb-8 rounded-[1.5rem] border border-[hsl(var(--seller-border))] bg-white/90 px-2 py-2 shadow-[0_18px_50px_-30px_hsl(var(--seller-shadow)/0.4)] backdrop-blur-md sm:top-20"
    >
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium text-[hsl(var(--seller-muted))] transition hover:bg-[hsl(var(--seller-info-soft))] hover:text-[hsl(var(--seller-info-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seller-info))]/40"
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
