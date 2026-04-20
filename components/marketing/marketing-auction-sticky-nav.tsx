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
      className="sticky top-16 z-30 -mx-px mb-8 rounded-xl border border-white/10 bg-[#0a0b10]/90 px-2 py-2 shadow-lg shadow-black/20 backdrop-blur-md sm:top-20"
    >
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-white/5 hover:text-[#ff3b5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b5c]/50"
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
