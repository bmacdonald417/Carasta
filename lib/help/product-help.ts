/**
 * Phase 2U — in-product help surfacing + retrieval readiness.
 * Phase 2V — deterministic pathname-aware ranking lives in `help-retrieval.ts`
 * (read-only; reuses these topic ids and link sets).
 *
 * Stable `topicId` values identify canonical public Resources / trust destinations
 * from product surfaces. They are safe to use later for assistant routing,
 * analytics, or retrieval without implying a vector/RAG stack exists today.
 */

export const PRODUCT_HELP_CONTEXTS = [
  "carmunity.explore",
  "carmunity.discussions",
  "carmunity.settings_interests",
  "market.auctions",
  "market.sell",
  "settings.account",
  "product.messages",
  "seller.marketing",
  "product.welcome",
  "guest.gate",
] as const;

export type ProductHelpContext = (typeof PRODUCT_HELP_CONTEXTS)[number];

export type ProductHelpLink = {
  /** Stable id for this destination (e.g. assistant / logging / retrieval keys). */
  topicId: string;
  href: string;
  label: string;
  /** One-line excerpt; optional UI uses this for minimal previews. */
  excerpt: string;
};

const CONTEXT_INTRO: Record<
  ProductHelpContext,
  { title: string; description: string }
> = {
  "carmunity.explore": {
    title: "Carmunity quick help",
    description:
      "Deep links into the public Resources layer for Carmunity, Discussions vocabulary, and common questions.",
  },
  "carmunity.discussions": {
    title: "Discussions quick help",
    description:
      "Canonical guides for thread behavior, direct messages, and trust expectations — without duplicating policy text here.",
  },
  "carmunity.settings_interests": {
    title: "Discovery & interests",
    description:
      "How Gears map to Explore and Discussions, plus where to read the broader Carmunity model.",
  },
  "market.auctions": {
    title: "Market & auctions",
    description:
      "High-signal links for bidding mechanics, buyer expectations, and platform trust boundaries.",
  },
  "market.sell": {
    title: "Selling & listings",
    description:
      "Seller-focused guides and auction mechanics live on Resources — use these before guessing at edge cases.",
  },
  "settings.account": {
    title: "Account & profile help",
    description:
      "Identity, messaging, FAQs, and escalation paths when something needs human review.",
  },
  "product.messages": {
    title: "Messages help",
    description:
      "What Messages are for, how they relate to Discussions, and where trust boundaries are explained.",
  },
  "seller.marketing": {
    title: "Seller workspace help",
    description:
      "Connect marketing work back to seller and auction fundamentals plus the trust layer.",
  },
  "product.welcome": {
    title: "Get oriented",
    description:
      "Short paths into the public product map, FAQs, and trust context right after you join.",
  },
  "guest.gate": {
    title: "Previewing Carasta?",
    description:
      "Read-only previews stay public; participation unlocks with a free account. These links explain how that works.",
  },
};

const LINKS: Record<ProductHelpContext, ProductHelpLink[]> = {
  "carmunity.explore": [
    {
      topicId: "resource.what_is_carmunity",
      href: "/resources/what-is-carmunity",
      label: "What is Carmunity?",
      excerpt: "How the community layer fits the rest of Carasta.",
    },
    {
      topicId: "resource.discussions_basics",
      href: "/resources/discussions-basics",
      label: "Discussions basics",
      excerpt: "Why “Discussions” is the canonical public term for threads.",
    },
    {
      topicId: "resource.faq",
      href: "/resources/faq",
      label: "FAQ",
      excerpt: "Fast answers across Carmunity, Market, and Resources.",
    },
  ],
  "carmunity.discussions": [
    {
      topicId: "resource.discussions_basics",
      href: "/resources/discussions-basics",
      label: "Discussions basics",
      excerpt: "Thread model, vocabulary, and how this surface fits Carmunity.",
    },
    {
      topicId: "resource.messages_basics",
      href: "/resources/messages-basics",
      label: "Messages basics",
      excerpt: "When direct messages fit versus public Discussions.",
    },
    {
      topicId: "resource.trust_and_safety",
      href: "/resources/trust-and-safety",
      label: "Trust & safety",
      excerpt: "Moderation posture, help paths, and what the platform does not claim.",
    },
    {
      topicId: "policy.community_guidelines",
      href: "/community-guidelines",
      label: "Community Guidelines",
      excerpt: "Conduct expectations for Carmunity and Discussions.",
    },
  ],
  "carmunity.settings_interests": [
    {
      topicId: "resource.what_is_carmunity",
      href: "/resources/what-is-carmunity",
      label: "What is Carmunity?",
      excerpt: "How discovery and identity connect across the product.",
    },
    {
      topicId: "resource.discussions_basics",
      href: "/resources/discussions-basics",
      label: "Discussions basics",
      excerpt: "How Gears and threads relate to the same identity model.",
    },
    {
      topicId: "resource.faq",
      href: "/resources/faq",
      label: "FAQ",
      excerpt: "Common questions about feeds, interests, and terminology.",
    },
  ],
  "market.auctions": [
    {
      topicId: "resource.auction_basics",
      href: "/resources/auction-basics",
      label: "Auction basics",
      excerpt: "Live bidding, reserve context, and anti-sniping at a high level.",
    },
    {
      topicId: "resource.buying_on_carasta",
      href: "/resources/buying-on-carasta",
      label: "Buying on Carasta",
      excerpt: "What to expect before, during, and after you bid.",
    },
    {
      topicId: "resource.trust_and_safety",
      href: "/resources/trust-and-safety",
      label: "Trust & safety",
      excerpt: "Platform trust posture and escalation paths.",
    },
  ],
  "market.sell": [
    {
      topicId: "resource.selling_on_carasta",
      href: "/resources/selling-on-carasta",
      label: "Selling on Carasta",
      excerpt: "Seller story, responsibilities, and how listings fit the platform.",
    },
    {
      topicId: "resource.auction_basics",
      href: "/resources/auction-basics",
      label: "Auction basics",
      excerpt: "Mechanics buyers and sellers both need to understand clearly.",
    },
    {
      topicId: "resource.trust_and_safety",
      href: "/resources/trust-and-safety",
      label: "Trust & safety",
      excerpt: "Trust boundaries, moderation context, and human escalation.",
    },
  ],
  "settings.account": [
    {
      topicId: "resource.profiles_and_garage",
      href: "/resources/profiles-and-garage",
      label: "Profiles & Garage",
      excerpt: "How public identity and Garage context work on Carasta.",
    },
    {
      topicId: "resource.messages_basics",
      href: "/resources/messages-basics",
      label: "Messages basics",
      excerpt: "What direct messaging is for — and what it is not.",
    },
    {
      topicId: "resource.faq",
      href: "/resources/faq",
      label: "FAQ",
      excerpt: "Self-serve answers before you reach out to the team.",
    },
    {
      topicId: "support.contact",
      href: "/contact",
      label: "Contact",
      excerpt: "Human escalation when self-serve pages are not enough.",
    },
  ],
  "product.messages": [
    {
      topicId: "resource.messages_basics",
      href: "/resources/messages-basics",
      label: "Messages basics",
      excerpt: "Direct conversations inside the same identity model as Carmunity.",
    },
    {
      topicId: "resource.discussions_basics",
      href: "/resources/discussions-basics",
      label: "Discussions basics",
      excerpt: "When a thread should stay public versus move to Messages.",
    },
    {
      topicId: "resource.trust_and_safety",
      href: "/resources/trust-and-safety",
      label: "Trust & safety",
      excerpt: "Trust framing for private and public interaction.",
    },
  ],
  "seller.marketing": [
    {
      topicId: "resource.selling_on_carasta",
      href: "/resources/selling-on-carasta",
      label: "Selling on Carasta",
      excerpt: "Seller fundamentals tied to listings and marketplace trust.",
    },
    {
      topicId: "resource.auction_basics",
      href: "/resources/auction-basics",
      label: "Auction basics",
      excerpt: "Mechanics your buyers see — keep marketing aligned with reality.",
    },
    {
      topicId: "resource.trust_and_safety",
      href: "/resources/trust-and-safety",
      label: "Trust & safety",
      excerpt: "Responsible promotion, claims, and escalation paths.",
    },
  ],
  "product.welcome": [
    {
      topicId: "marketing.how_it_works",
      href: "/how-it-works",
      label: "How it works",
      excerpt: "Product-wide map: Carmunity, Market, and Resources together.",
    },
    {
      topicId: "resource.faq",
      href: "/resources/faq",
      label: "FAQ",
      excerpt: "Orientation answers for new members.",
    },
    {
      topicId: "resource.trust_and_safety",
      href: "/resources/trust-and-safety",
      label: "Trust & safety",
      excerpt: "Conduct, moderation, and how to escalate concerns.",
    },
  ],
  "guest.gate": [
    {
      topicId: "marketing.how_it_works",
      href: "/how-it-works",
      label: "How it works",
      excerpt: "What preview mode is versus full participation.",
    },
    {
      topicId: "resource.faq",
      href: "/resources/faq",
      label: "FAQ",
      excerpt: "Common questions about guest previews and membership.",
    },
    {
      topicId: "resource.trust_and_safety",
      href: "/resources/trust-and-safety",
      label: "Trust & safety",
      excerpt: "Trust context if you are deciding whether to join.",
    },
  ],
};

export function getProductHelpIntro(context: ProductHelpContext) {
  return CONTEXT_INTRO[context];
}

export function getProductHelpLinks(context: ProductHelpContext) {
  return LINKS[context];
}
