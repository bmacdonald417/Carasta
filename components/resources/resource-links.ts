import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Car,
  FileText,
  Gavel,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

export type ResourceLinkItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type ResourceSection = {
  title: string;
  description: string;
  items: ResourceLinkItem[];
};

export const resourceSections: ResourceSection[] = [
  {
    title: "Getting started",
    description:
      "Start here if you need the platform explained clearly before you dive into specific workflows.",
    items: [
      {
        title: "What is Carasta?",
        description:
          "A clear overview of how Carmunity, Discussions, Messages, profiles, Garage identity, auctions, and seller tools fit together.",
        href: "/resources/what-is-carasta",
        icon: Sparkles,
      },
      {
        title: "How It Works",
        description:
          "The high-level product guide for how community, identity, marketplace activity, and help paths connect.",
        href: "/how-it-works",
        icon: BookOpen,
      },
      {
        title: "FAQ",
        description:
          "Quick answers to the most common public questions about the platform and product vocabulary.",
        href: "/resources/faq",
        icon: HelpCircle,
      },
      {
        title: "Platform glossary",
        description:
          "Definitions for the core Carasta concepts that appear across the public site and product.",
        href: "/resources/glossary",
        icon: FileText,
      },
    ],
  },
  {
    title: "Platform concepts",
    description:
      "Understand the social and identity layers that make Carasta more than a listing destination.",
    items: [
      {
        title: "What is Carmunity?",
        description:
          "See how the community layer works and why it leads the product story.",
        href: "/resources/what-is-carmunity",
        icon: Users,
      },
      {
        title: "Discussions basics",
        description:
          "How thread-based Discussions fit into the broader platform and why the term is standardized publicly.",
        href: "/resources/discussions-basics",
        icon: MessageSquare,
      },
      {
        title: "Profiles and Garage",
        description:
          "How identity, ownership, and dream-car expression fit into the public product model.",
        href: "/resources/profiles-and-garage",
        icon: UserRound,
      },
      {
        title: "Messages basics",
        description:
          "How messaging fits into the platform and where it sits relative to public and private interaction.",
        href: "/resources/messages-basics",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Buying and selling",
    description:
      "Learn the basics of participating in auctions and using the seller side of the platform responsibly.",
    items: [
      {
        title: "Auction basics",
        description:
          "A public overview of bidding, reserve state, anti-sniping, and what auction participation looks like on Carasta.",
        href: "/resources/auction-basics",
        icon: Gavel,
      },
      {
        title: "Buying on Carasta",
        description:
          "What buyers should expect before bidding, during a live auction, and after a sale closes.",
        href: "/resources/buying-on-carasta",
        icon: Car,
      },
      {
        title: "Selling on Carasta",
        description:
          "What sellers can do on the platform and how seller tools fit into the current product.",
        href: "/resources/selling-on-carasta",
        icon: Sparkles,
      },
    ],
  },
  {
    title: "Trust and support",
    description:
      "Use these pages when you need help, need the moderation/support path explained, or want the current trust documents.",
    items: [
      {
        title: "Trust and safety",
        description:
          "A practical overview of platform expectations, moderation, help paths, and current trust boundaries.",
        href: "/resources/trust-and-safety",
        icon: ShieldCheck,
      },
      {
        title: "Community Guidelines",
        description:
          "The current public standards for conduct in Carmunity and Discussions.",
        href: "/community-guidelines",
        icon: MessageSquare,
      },
      {
        title: "Privacy Policy",
        description:
          "The current draft privacy structure and where to go for questions about data handling.",
        href: "/privacy",
        icon: ShieldCheck,
      },
      {
        title: "Terms & Conditions",
        description:
          "The current draft terms structure, written to be clearer while final legal review is still pending.",
        href: "/terms",
        icon: FileText,
      },
      {
        title: "Contact",
        description:
          "Reach the Carasta team when you need help beyond the public resources layer.",
        href: "/contact",
        icon: LifeBuoy,
      },
    ],
  },
];

export const allResourceLinks = resourceSections.flatMap((section) => section.items);

export function pickResourceLinks(hrefs: string[]) {
  return hrefs
    .map((href) => allResourceLinks.find((item) => item.href === href))
    .filter((item): item is ResourceLinkItem => Boolean(item));
}
