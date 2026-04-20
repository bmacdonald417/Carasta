import type { MarketingLinkKit, MarketingLinkVariant } from "@/lib/marketing/build-marketing-links";
import { buildMarketingLinkKit } from "@/lib/marketing/build-marketing-links";
import { getPublicSiteOrigin } from "@/lib/marketing/site-origin";
import type { MarketingCopilotStructuredResult } from "@/lib/validations/marketing-copilot";

function channelToVariants(channelRaw: string): MarketingLinkVariant[] {
  const c = channelRaw.trim().toLowerCase();
  if (c === "instagram") return ["instagram"];
  if (c === "facebook") return ["facebook"];
  if (c === "carmunity") return ["carmunity"];
  if (c === "email") return ["email"];
  if (c === "x" || c === "twitter") return ["default"];
  if (c === "google") return ["default"];
  if (c === "forums") return ["default"];
  return ["default"];
}

function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const key = u.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

/**
 * Appends trackable listing URLs for the artifact's channel without duplicating existing URLs.
 */
export function injectLinkKitIntoArtifacts(
  artifacts: MarketingCopilotStructuredResult["artifacts"],
  auctionId: string,
  origin?: string
): MarketingCopilotStructuredResult["artifacts"] {
  const kit: MarketingLinkKit = buildMarketingLinkKit(auctionId, origin ?? getPublicSiteOrigin());

  return artifacts.map((a) => {
    const variants = channelToVariants(a.channel ?? "");
    const urls = uniqueUrls(variants.map((v) => kit[v]));
    const missing = urls.filter((u) => !a.content.includes(u));
    if (missing.length === 0) return a;

    const block = ["", "Tracked listing links:", ...missing.map((u) => `- ${u}`)].join("\n");
    return {
      ...a,
      content: `${a.content.trimEnd()}${block}`,
    };
  });
}
