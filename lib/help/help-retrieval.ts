/**
 * Phase 2V — bounded, read-only help retrieval.
 *
 * Deterministic ranking and related-topic expansion on top of `product-help.ts`.
 * No embeddings, no generative answers, no assistant chat.
 */

import {
  PRODUCT_HELP_CONTEXTS,
  type ProductHelpContext,
  type ProductHelpLink,
  getProductHelpLinks,
} from "./product-help";

/** Bump when the ranking / related graph rules change (assistant bridge metadata). */
export const HELP_RETRIEVAL_SCHEMA_VERSION = "2v.1";

const DISCUSSION_THREAD_PATH_RE = /^\/discussions\/[^/]+\/[^/]+\/[^/]+/;
const AUCTION_DETAIL_PATH_RE = /^\/auctions\/[^/]+$/;
const MESSAGES_CONVERSATION_PATH_RE = /^\/messages\/[^/]+$/;
const MARKETING_PATH_RE = /\/marketing(\/|$)/;

/** Directed edges: primary topic → related canonical topics (must exist in the global index). */
const RELATED_TOPIC_IDS: Partial<Record<string, readonly string[]>> = {
  "resource.what_is_carmunity": ["resource.discussions_basics", "resource.faq"],
  "resource.discussions_basics": [
    "resource.messages_basics",
    "resource.trust_and_safety",
    "policy.community_guidelines",
  ],
  "resource.messages_basics": ["resource.trust_and_safety", "resource.discussions_basics"],
  "resource.auction_basics": ["resource.buying_on_carasta", "resource.selling_on_carasta"],
  "resource.buying_on_carasta": ["resource.trust_and_safety", "support.contact"],
  "resource.selling_on_carasta": ["resource.auction_basics", "resource.trust_and_safety"],
  "resource.faq": ["resource.trust_and_safety", "resource.discussions_basics"],
  "marketing.how_it_works": ["resource.faq", "resource.trust_and_safety"],
  "resource.trust_and_safety": ["policy.community_guidelines", "resource.faq"],
  "policy.community_guidelines": ["resource.trust_and_safety", "resource.discussions_basics"],
  "resource.profiles_and_garage": ["resource.faq", "resource.messages_basics"],
};

let canonicalTopicIndex: Map<string, ProductHelpLink> | null = null;

function buildCanonicalTopicIndex(): Map<string, ProductHelpLink> {
  const map = new Map<string, ProductHelpLink>();
  for (const ctx of PRODUCT_HELP_CONTEXTS) {
    for (const link of getProductHelpLinks(ctx)) {
      if (!map.has(link.topicId)) map.set(link.topicId, link);
    }
  }
  return map;
}

export function getCanonicalHelpTopicById(topicId: string): ProductHelpLink | undefined {
  if (!canonicalTopicIndex) canonicalTopicIndex = buildCanonicalTopicIndex();
  return canonicalTopicIndex.get(topicId);
}

/** Normalized public path without query or hash. */
function normalizeCanonicalHref(href: string) {
  return href.split("?")[0].split("#")[0];
}

/**
 * Resolve a public help URL to the closest canonical `ProductHelpLink` (topic id).
 * Includes a tiny static table for hub paths that are not represented as single-topic rows
 * in every context map (e.g. `/resources`, `/why-carasta`, legal drafts).
 */
const STATIC_HELP_BY_HREF: Record<string, ProductHelpLink> = {
  "/resources": {
    topicId: "palette.resources_hub",
    href: "/resources",
    label: "Resources hub",
    excerpt: "Full index of guides, FAQs, glossary, and trust documents.",
  },
  "/why-carasta": {
    topicId: "palette.why_carasta",
    href: "/why-carasta",
    label: "Why Carasta",
    excerpt: "Positioning: Carmunity-first, market-proven, seller-intelligent direction.",
  },
  "/terms": {
    topicId: "policy.terms",
    href: "/terms",
    label: "Terms & Conditions",
    excerpt: "Draft terms structure and platform expectations.",
  },
  "/privacy": {
    topicId: "policy.privacy",
    href: "/privacy",
    label: "Privacy Policy",
    excerpt: "Draft privacy structure and data expectations.",
  },
  "/sell": {
    topicId: "palette.sell_entry",
    href: "/sell",
    label: "Sell",
    excerpt: "Create listings and enter seller flows inside the product.",
  },
};

export function findCanonicalHelpTopicByHref(href: string): ProductHelpLink | undefined {
  let base = normalizeCanonicalHref(href);
  if (base.startsWith("http://") || base.startsWith("https://")) {
    try {
      base = new URL(base).pathname || "/";
    } catch {
      return undefined;
    }
  }
  if (!base.startsWith("/")) base = `/${base}`;
  if (!canonicalTopicIndex) canonicalTopicIndex = buildCanonicalTopicIndex();
  for (const link of Array.from(canonicalTopicIndex.values())) {
    if (link.href === base) return link;
  }
  return STATIC_HELP_BY_HREF[base];
}

function scoreLinkForPathname(
  pathname: string,
  link: ProductHelpLink,
  context: ProductHelpContext
): number {
  let score = 0;

  if (DISCUSSION_THREAD_PATH_RE.test(pathname)) {
    if (link.topicId === "resource.trust_and_safety") score += 5;
    if (link.topicId === "policy.community_guidelines") score += 5;
    if (link.topicId === "resource.discussions_basics") score += 4;
    if (link.topicId === "resource.messages_basics") score += 2;
  }

  if (AUCTION_DETAIL_PATH_RE.test(pathname)) {
    if (link.topicId === "resource.buying_on_carasta") score += 5;
    if (link.topicId === "resource.auction_basics") score += 4;
    if (link.topicId === "resource.trust_and_safety") score += 2;
  }

  if (MESSAGES_CONVERSATION_PATH_RE.test(pathname) && pathname !== "/messages") {
    if (link.topicId === "resource.messages_basics") score += 5;
    if (link.topicId === "resource.trust_and_safety") score += 3;
    if (link.topicId === "resource.discussions_basics") score += 1;
  }

  if (MARKETING_PATH_RE.test(pathname) && context === "seller.marketing") {
    if (link.topicId === "resource.selling_on_carasta") score += 3;
    if (link.topicId === "resource.auction_basics") score += 3;
    if (link.topicId === "resource.trust_and_safety") score += 1;
  }

  if (pathname.startsWith("/sell")) {
    if (link.topicId === "resource.selling_on_carasta") score += 2;
    if (link.topicId === "resource.auction_basics") score += 1;
  }

  if (pathname.startsWith("/settings")) {
    if (link.topicId === "resource.profiles_and_garage") score += 2;
    if (link.topicId === "resource.faq") score += 1;
  }

  if (pathname.startsWith("/welcome")) {
    if (link.topicId === "marketing.how_it_works") score += 2;
    if (link.topicId === "resource.faq") score += 1;
  }

  return score;
}

/**
 * Stable sort: higher score first; ties preserve original order.
 */
export function rankHelpLinksForPathname(
  links: ProductHelpLink[],
  pathname: string,
  context: ProductHelpContext
): ProductHelpLink[] {
  const decorated = links.map((link, index) => ({
    link,
    index,
    score: scoreLinkForPathname(pathname, link, context),
  }));
  decorated.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });
  return decorated.map((d) => d.link);
}

export function collectRelatedHelpLinks(
  primary: ProductHelpLink[],
  limit: number
): ProductHelpLink[] {
  if (limit <= 0) return [];
  const primaryHrefs = new Set(primary.map((p) => p.href));
  const seen = new Set<string>();
  const out: ProductHelpLink[] = [];

  for (const seed of primary) {
    const related = RELATED_TOPIC_IDS[seed.topicId];
    if (!related) continue;
    for (const topicId of related) {
      if (out.length >= limit) return out;
      if (seen.has(topicId)) continue;
      const link = getCanonicalHelpTopicById(topicId);
      if (!link || primaryHrefs.has(link.href)) continue;
      seen.add(topicId);
      out.push(link);
    }
  }
  return out;
}

export type RetrievedHelpBundle = {
  primary: ProductHelpLink[];
  related: ProductHelpLink[];
};

export function getRetrievedHelpBundle(
  context: ProductHelpContext,
  pathname: string | null,
  options?: { primaryLimit?: number; relatedLimit?: number }
): RetrievedHelpBundle {
  const raw = getProductHelpLinks(context);
  const primaryLimit = options?.primaryLimit;
  const path = pathname?.split("?")[0] ?? "";
  const relatedCap =
    context === "guest.gate"
      ? 0
      : options?.relatedLimit !== undefined
        ? options.relatedLimit
        : 2;

  const ranked =
    path && context !== "guest.gate"
      ? rankHelpLinksForPathname(raw, path, context)
      : raw;

  const primary =
    typeof primaryLimit === "number" && primaryLimit > 0
      ? ranked.slice(0, primaryLimit)
      : ranked;

  const related =
    relatedCap > 0 && path ? collectRelatedHelpLinks(primary, relatedCap) : [];

  return { primary, related };
}

/**
 * Route → default help context for future palette / instrumentation.
 * Returns null when no strong default (caller supplies explicit context).
 */
export function resolveProductHelpContextFromPathname(
  pathname: string | null | undefined
): ProductHelpContext | null {
  if (!pathname) return null;
  const path = pathname.split("?")[0];
  if (path === "/explore" || path.startsWith("/explore/")) return "carmunity.explore";
  if (path === "/discussions" || path.startsWith("/discussions/")) return "carmunity.discussions";
  if (path === "/messages" || path.startsWith("/messages/")) return "product.messages";
  if (path === "/auctions" || path.startsWith("/auctions/")) return "market.auctions";
  if (path === "/sell" || path.startsWith("/sell/")) return "market.sell";
  if (path.startsWith("/settings")) return "settings.account";
  if (path === "/welcome" || path.startsWith("/welcome/")) return "product.welcome";
  if (MARKETING_PATH_RE.test(path)) return "seller.marketing";
  return null;
}
