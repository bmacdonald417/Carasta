import type {
  MarketingDigestSnapshot,
  DigestAuctionLine,
} from "@/lib/marketing/generate-marketing-digest";
import { getPublicSiteOrigin } from "@/lib/marketing/site-origin";
import { designTokens } from "@/lib/design-tokens";

/** Inline email styles cannot use CSS variables; mirror web functional accent (blue-violet). */
const DIGEST_ACCENT = designTokens.colors.accentBlueVioletApproxHex;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absUrl(origin: string, path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

function section(title: string, inner: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;font-family:system-ui,Segoe UI,sans-serif;font-size:14px;color:#1a1a1a;">
    <tr><td style="padding-bottom:8px;border-bottom:2px solid ${DIGEST_ACCENT};font-weight:600;font-size:15px;">${esc(title)}</td></tr>
    <tr><td style="padding-top:12px;">${inner}</td></tr>
  </table>`;
}

function listAuctions(
  origin: string,
  rows: DigestAuctionLine[],
  handle: string
): string {
  if (rows.length === 0) {
    return `<p style="margin:0;color:#666;">No listings in this section right now.</p>`;
  }
  return `<ul style="margin:0;padding-left:20px;">${rows
    .map((r) => {
      const href = absUrl(
        origin,
        `/u/${handle.toLowerCase()}/marketing/auctions/${r.id}`
      );
      const label = `${r.title} — ${r.views} views · ${r.bidClicks} bid clicks (intent)`;
      return `<li style="margin-bottom:8px;"><a href="${href}" style="color:#cc2244;">${esc(label)}</a></li>`;
    })
    .join("")}</ul>`;
}

function listAlerts(origin: string, alerts: MarketingDigestSnapshot["recentAlerts"]) {
  if (alerts.length === 0) {
    return `<p style="margin:0;color:#666;">No marketing alerts this week.</p>`;
  }
  return `<ul style="margin:0;padding-left:20px;">${alerts
    .map((a) => {
      const href = absUrl(origin, a.marketingHref);
      if (href) {
        return `<li style="margin-bottom:8px;"><a href="${href}" style="color:${DIGEST_ACCENT};">${esc(a.title)}</a></li>`;
      }
      return `<li style="margin-bottom:8px;">${esc(a.title)}</li>`;
    })
    .join("")}</ul>`;
}

function listCampaigns(origin: string, camps: MarketingDigestSnapshot["activeCampaigns"]) {
  if (camps.length === 0) {
    return `<p style="margin:0;color:#666;">No active campaigns.</p>`;
  }
  return `<ul style="margin:0;padding-left:20px;">${camps
    .map((c) => {
      const href = absUrl(origin, c.marketingHref);
      const line = `${c.name} (${c.status}) — ${c.auctionTitle}`;
      return `<li style="margin-bottom:8px;"><a href="${href}" style="color:${DIGEST_ACCENT};">${esc(line)}</a></li>`;
    })
    .join("")}</ul>`;
}

export function renderMarketingDigestEmail(snapshot: MarketingDigestSnapshot): {
  subject: string;
  html: string;
  text: string;
} {
  const origin = getPublicSiteOrigin();
  const handle = snapshot.handle.toLowerCase();
  const marketingHome = absUrl(origin, `/u/${handle}/marketing`)!;

  const subject = `Your weekly Carasta marketing summary — @${snapshot.handle}`;

  const intro = `
  <p style="margin:0 0 16px;line-height:1.5;">Hi ${esc(snapshot.greetingName)},</p>
  <p style="margin:0 0 16px;line-height:1.5;color:#444;">
    Here is your <strong>weekly</strong> marketing snapshot: live listings, traffic signals, and things worth a look.
    You’re receiving this because you opted in under Settings.
  </p>
  <p style="margin:0 0 8px;line-height:1.5;">
    <strong>At a glance:</strong> ${snapshot.overview.liveAuctions} live · ${snapshot.overview.totalViews} total views · ${snapshot.overview.totalShareClicks} share clicks · ${snapshot.overview.totalBidClicks} bid clicks (intent) · ${snapshot.overview.activeCampaigns} active campaigns
  </p>
  <p style="margin:0 0 24px;"><a href="${marketingHome}" style="color:${DIGEST_ACCENT};font-weight:600;">Open Marketing dashboard →</a></p>`;

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f5;">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:28px;border-radius:12px;border:1px solid #e5e5e5;">
    ${intro}
    ${section("Recent marketing alerts", listAlerts(origin, snapshot.recentAlerts))}
    ${section("Top live listings by views", listAuctions(origin, snapshot.topByViews, snapshot.handle))}
    ${section("Top live listings by bid-button intent", listAuctions(origin, snapshot.topByBidClicks, snapshot.handle))}
    ${section("Ending within ~7 days", listAuctions(origin, snapshot.endingSoon, snapshot.handle))}
    ${section("May need a push (low tracked signals)", listAuctions(origin, snapshot.lowEngagement, snapshot.handle))}
    ${section("Active campaigns", listCampaigns(origin, snapshot.activeCampaigns))}
    <p style="margin:24px 0 0;font-size:12px;color:#888;">You can turn off this digest anytime in <a href="${absUrl(origin, "/settings")!}" style="color:#666;">Settings</a>. In-app alerts stay in the bell menu.</p>
  </div></body></html>`;

  const text = [
    `Hi ${snapshot.greetingName}`,
    "",
    `Live: ${snapshot.overview.liveAuctions} | Views: ${snapshot.overview.totalViews} | Shares: ${snapshot.overview.totalShareClicks} | Bid clicks: ${snapshot.overview.totalBidClicks}`,
    `Marketing: ${marketingHome}`,
    "",
    "Recent alerts:",
    ...snapshot.recentAlerts.map((a) => `- ${a.title}`),
  ].join("\n");

  return { subject, html, text };
}
