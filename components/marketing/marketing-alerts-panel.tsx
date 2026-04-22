import Link from "next/link";
import { Bell } from "lucide-react";
import type { SellerMarketingNotificationRow } from "@/lib/marketing/get-seller-marketing-notifications";
import { formatMarketingDateTime } from "@/lib/marketing/marketing-display";
import { SellerSectionPanel } from "@/components/marketing/seller-workspace-primitives";

export function MarketingAlertsPanel({
  items,
  compact = false,
  context = "overview",
}: {
  items: SellerMarketingNotificationRow[];
  compact?: boolean;
  /** `auction`: copy tuned for listing drill-down (filtered alerts). */
  context?: "overview" | "auction";
}) {
  const emptyCopy =
    context === "auction"
      ? "Nothing flagged for this listing yet. See all alerts on Marketing home or open the notifications bell in the header."
      : "You’re caught up. Alerts appear when traffic shifts, listings wind down, or campaigns start.";

  return (
    <SellerSectionPanel
      title={`Marketing alerts${context === "auction" ? " · this listing" : ""}`}
      description="Same seller signal queue as the header notifications bell. Use this layer for issues, shifts, and reminders that need action."
      tone="caution"
      className={compact ? "p-0" : ""}
    >
      <div className={compact ? "-mt-2" : "-mt-1"}>
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-caution/25 bg-caution-soft px-4 py-3 text-caution-foreground">
          <div className="rounded-lg bg-card p-2 text-caution-foreground shadow-sm">
            <Bell className="h-5 w-5" />
          </div>
          <p className="text-sm">
            One seller inbox for alerts, reminders, and marketing signals.
          </p>
        </div>
      {items.length === 0 ? (
        <p className="text-sm text-[hsl(var(--seller-muted))]">{emptyCopy}</p>
      ) : (
        <ul className={`divide-y divide-border rounded-2xl border border-border bg-card shadow-sm ${compact ? "space-y-0" : ""}`}>
          {items.map((n) => (
            <li key={n.id} className="px-4 py-3 first:pt-3">
              {n.marketingHref ? (
                <Link
                  href={n.marketingHref}
                  className="block text-sm text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="line-clamp-2">{n.title}</span>
                  <span className="mt-1 block text-xs text-[hsl(var(--seller-muted))]">
                    {formatMarketingDateTime(n.createdAt)}
                    {!n.readAt ? " · unread" : ""}
                  </span>
                </Link>
              ) : (
                <div className="text-sm text-[hsl(var(--seller-foreground))]">
                  <span className="line-clamp-2">{n.title}</span>
                  <span className="mt-1 block text-xs text-[hsl(var(--seller-muted))]">
                    {formatMarketingDateTime(n.createdAt)}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      </div>
    </SellerSectionPanel>
  );
}
