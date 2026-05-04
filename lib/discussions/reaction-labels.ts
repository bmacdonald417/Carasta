import type { DiscussionReactionKind } from "@prisma/client";

export const DISCUSSION_REACTION_KIND_ORDER: DiscussionReactionKind[] = [
  "LIKE",
  "FIRE",
  "WRENCH",
  "MIND_BLOWN",
  "LAUGH",
  "RESPECT",
  // DISLIKE intentionally excluded from the emoji picker -- used only by the vote system
];

export const DISCUSSION_REACTION_LABELS: Record<DiscussionReactionKind, string> = {
  LIKE: "Like",
  FIRE: "Fire",
  WRENCH: "Wrench",
  MIND_BLOWN: "Mind blown",
  LAUGH: "Laugh",
  RESPECT: "Respect",
  DISLIKE: "Downvote",
};

/** Short labels for compact reaction summaries. */
export const DISCUSSION_REACTION_COMPACT: Record<DiscussionReactionKind, string> = {
  LIKE: "Like",
  FIRE: "Fire",
  WRENCH: "Wrench",
  MIND_BLOWN: "Mind",
  LAUGH: "Laugh",
  RESPECT: "Respect",
  DISLIKE: "Downvote",
};

/** Primary display for summaries and menus. DISLIKE hidden from picker but must be mapped. */
export const DISCUSSION_REACTION_EMOJI: Record<DiscussionReactionKind, string> = {
  LIKE: "\ud83d\udc4d",
  FIRE: "\ud83d\udd25",
  WRENCH: "\ud83d\udd27",
  MIND_BLOWN: "\ud83e\udd2f",
  LAUGH: "\ud83d\ude02",
  RESPECT: "\ud83e\uddd1\u200d\u2708\ufe0f",
  DISLIKE: "\ud83d\udc4e",
};
