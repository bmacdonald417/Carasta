import Link from "next/link";
import { Bell } from "lucide-react";
import type { SellerMarketingNotificationRow } from "@/lib/marketing/get-seller-marketing-notifications";
import { formatMarketingDateTime } from "@/lib/marketing/marketing-display";

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
      ? "No marketing alerts for this listing yet. All alerts still show on the main Marketing page and in the bell menu."
      : "No marketing alerts right now. Check back after more traffic or when a listing is ending soon.";

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] ${compact ? "p-4" : "p-6"}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-[#ff3b5c]/15 p-2">
          <Bell className="h-5 w-5 text-[#ff3b5c]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            className={`font-display font-semibold text-neutral-100 ${compact ? "text-base" : "text-lg"}`}
          >
            Marketing alerts
            {context === "auction" ? (
              <span className="ml-2 font-normal text-muted-foreground">
                (this listing)
              </span>
            ) : null}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            In-app only — based on your listing activity and campaigns. Also
            appears in the bell menu.
          </p>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">{emptyCopy}</p>
      ) : (
        <ul className={`mt-4 divide-y divide-white/5 ${compact ? "space-y-0" : ""}`}>
          {items.map((n) => (
            <li key={n.id} className="py-3 first:pt-2">
              {n.marketingHref ? (
                <Link
                  href={n.marketingHref}
                  className="block text-sm text-neutral-200 hover:text-neutral-50"
                >
                  <span className="line-clamp-2">{n.title}</span>
                  <span className="mt-1 block text-xs text-neutral-500">
                    {formatMarketingDateTime(n.createdAt)}
                    {!n.readAt ? " · unread" : ""}
                  </span>
                </Link>
              ) : (
                <div className="text-sm text-neutral-200">
                  <span className="line-clamp-2">{n.title}</span>
                  <span className="mt-1 block text-xs text-neutral-500">
                    {formatMarketingDateTime(n.createdAt)}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
