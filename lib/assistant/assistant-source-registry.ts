import path from "path";

import type { AssistantSourceDoc } from "@/lib/assistant/assistant-types";

const docsRoot = path.join(process.cwd(), "docs", "assistant");

export const assistantSourceRegistry: AssistantSourceDoc[] = [
  {
    id: "platform-overview",
    title: "Platform Overview",
    filePath: path.join(docsRoot, "platform-overview.md"),
    href: "/resources/what-is-carasta",
    summary: "What Carasta is, what it is for, and how Carmunity, marketplace, and seller tools fit together.",
  },
  {
    id: "community-and-conversation",
    title: "Community And Conversation",
    filePath: path.join(docsRoot, "community-and-conversation.md"),
    href: "/resources/what-is-carmunity",
    summary: "What Carmunity, Discussions, and Messages mean and how they fit into the platform.",
  },
  {
    id: "identity-and-garage",
    title: "Identity And Garage",
    filePath: path.join(docsRoot, "identity-and-garage.md"),
    href: "/resources/profiles-and-garage",
    summary: "How profiles and Garage fit into identity, trust, and participation.",
  },
  {
    id: "auctions-buying-and-selling",
    title: "Auctions Buying And Selling",
    filePath: path.join(docsRoot, "auctions-buying-and-selling.md"),
    href: "/resources/auction-basics",
    summary: "Auction basics plus general buyer and seller workflow framing.",
  },
  {
    id: "trust-safety-and-help",
    title: "Trust Safety And Help",
    filePath: path.join(docsRoot, "trust-safety-and-help.md"),
    href: "/resources/trust-and-safety",
    summary: "Trust boundaries, public help paths, and what the platform is and is not claiming.",
  },
  {
    id: "seller-workspace-and-ai",
    title: "Seller Workspace And AI",
    filePath: path.join(docsRoot, "seller-workspace-and-ai.md"),
    href: "/u/[handle]/marketing",
    summary: "What the seller growth workspace and seller AI systems are for at a general level.",
  },
  {
    id: "faq-and-glossary",
    title: "FAQ And Glossary",
    filePath: path.join(docsRoot, "faq-and-glossary.md"),
    href: "/resources/faq",
    summary: "High-signal FAQ answers and glossary terms for the core product vocabulary.",
  },
];
