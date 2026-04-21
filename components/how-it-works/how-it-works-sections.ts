/**
 * How It Works section content. Shared between timeline and any anchors.
 */
import type { LucideIcon } from "lucide-react";
import {
  UserRound,
  Users,
  MessageSquare,
  Gavel,
  Shield,
  BadgeCheck,
} from "lucide-react";

export const HOW_IT_WORKS_SECTIONS: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    id: "identity",
    icon: UserRound,
    title: "Build your profile and Garage",
    description:
      "Start with a real enthusiast identity. Your profile and Garage help you show what you own, what you are building, and what you are chasing next. Carasta is designed so your identity matters before you ever place a bid or list a car.",
  },
  {
    id: "carmunity",
    icon: Users,
    title: "Join the Carmunity",
    description:
      "Follow people, discover posts, and keep up with the cars and stories that actually interest you. Carmunity is the social layer that makes Carasta useful on ordinary days, not only on auction day.",
  },
  {
    id: "discussions",
    icon: MessageSquare,
    title: "Use Discussions and Messages",
    description:
      "Move from public conversation to direct connection without leaving the platform. Discussions help people swap context and opinions, while Messages make it easier to continue a conversation when it needs to become one-to-one.",
  },
  {
    id: "market",
    icon: Gavel,
    title: "Browse, bid, and sell with clearer mechanics",
    description:
      "When you step into the marketplace, Carasta gives you real auction tools: live bidding, reserve visibility, anti-sniping protection, watchlists, and seller surfaces that feel grounded in how enthusiasts actually evaluate cars.",
  },
  {
    id: "trust",
    icon: Shield,
    title: "Trust the process",
    description:
      "Buyer and seller confidence depends on transparency. Reserve state, seller identity, condition context, and platform rules help reduce guesswork and keep the experience legible.",
  },
  {
    id: "reputation",
    icon: BadgeCheck,
    title: "Stay connected after the transaction",
    description:
      "The point is not to disappear once the sale ends. Profiles, Garage identity, Carmunity, and Discussions give the platform ongoing value that outlives any single listing.",
  },
];
