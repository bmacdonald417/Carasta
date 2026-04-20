import type { DiscussionReactionKind } from "@prisma/client";

export const DISCUSSION_REACTION_KIND_ORDER: DiscussionReactionKind[] = [
  "LIKE",
  "FIRE",
  "WRENCH",
  "MIND_BLOWN",
  "LAUGH",
  "RESPECT",
];

export const DISCUSSION_REACTION_LABELS: Record<DiscussionReactionKind, string> = {
  LIKE: "Like",
  FIRE: "Fire",
  WRENCH: "Wrench",
  MIND_BLOWN: "Mind blown",
  LAUGH: "Laugh",
  RESPECT: "Respect",
};

/** Short labels for compact reaction summaries. */
export const DISCUSSION_REACTION_COMPACT: Record<DiscussionReactionKind, string> = {
  LIKE: "Like",
  FIRE: "Fire",
  WRENCH: "Wrench",
  MIND_BLOWN: "Mind",
  LAUGH: "Laugh",
  RESPECT: "Respect",
};

/** Primary display for summaries and menus — words remain in labels for accessibility. */
export const DISCUSSION_REACTION_EMOJI: Record<DiscussionReactionKind, string> = {
  LIKE: "👍",
  FIRE: "🔥",
  WRENCH: "🔧",
  MIND_BLOWN: "🤯",
  LAUGH: "😂",
  RESPECT: "🫡",
};
