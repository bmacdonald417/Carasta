/**
 * Phase 2W — read-only help palette model (deterministic, canonical URLs only).
 */

import type { ProductHelpContext, ProductHelpLink } from "./product-help";
import {
  getCanonicalHelpTopicById,
  getRetrievedHelpBundle,
  HELP_RETRIEVAL_SCHEMA_VERSION,
  resolveProductHelpContextFromPathname,
} from "./help-retrieval";

/** Bump when palette grouping / pins / copy change. */
export const HELP_PALETTE_SCHEMA_VERSION = "2w.1";

function dedupeByHref(links: ProductHelpLink[]): ProductHelpLink[] {
  const seen = new Set<string>();
  const out: ProductHelpLink[] = [];
  for (const link of links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  return out;
}

/**
 * Stable cross-route entry points (deduped against contextual results in the palette UI).
 */
export function getHelpPaletteGlobalPins(): ProductHelpLink[] {
  const pinned: ProductHelpLink[] = [
    {
      topicId: "palette.resources_hub",
      href: "/resources",
      label: "Resources hub",
      excerpt: "Full index of guides, FAQs, glossary, and trust documents.",
    },
    {
      topicId: "palette.why_carasta",
      href: "/why-carasta",
      label: "Why Carasta",
      excerpt: "How Carmunity, Market, and seller direction fit together.",
    },
  ];
  const fromIndex = (
    [
      "marketing.how_it_works",
      "resource.faq",
      "resource.trust_and_safety",
      "support.contact",
    ] as const
  )
    .map((id) => getCanonicalHelpTopicById(id))
    .filter((l): l is ProductHelpLink => Boolean(l));
  return dedupeByHref([...pinned, ...fromIndex]);
}

export type HelpPaletteModel = {
  context: ProductHelpContext;
  routeMatched: boolean;
  pathname: string;
  primary: ProductHelpLink[];
  related: ProductHelpLink[];
  globalPins: ProductHelpLink[];
  retrievalSchema: string;
  paletteSchema: string;
};

export function getHelpPaletteModel(pathname: string | null): HelpPaletteModel {
  const path = pathname?.split("?")[0] ?? "";
  const resolved = resolveProductHelpContextFromPathname(pathname);
  const context: ProductHelpContext = resolved ?? "carmunity.explore";
  const { primary, related } = getRetrievedHelpBundle(context, pathname, {
    primaryLimit: 6,
    relatedLimit: 4,
  });
  const primaryHrefs = new Set(primary.map((l) => l.href));
  const relatedHrefs = new Set(related.map((l) => l.href));
  const globalPins = getHelpPaletteGlobalPins().filter(
    (p) => !primaryHrefs.has(p.href) && !relatedHrefs.has(p.href)
  );
  return {
    context,
    routeMatched: resolved != null,
    pathname: path,
    primary,
    related,
    globalPins,
    retrievalSchema: HELP_RETRIEVAL_SCHEMA_VERSION,
    paletteSchema: HELP_PALETTE_SCHEMA_VERSION,
  };
}
