/** Canonical Discussions thread URL (unchanged path shape). */
export function discussionThreadPath(
  gearSlug: string,
  lowerGearSlug: string,
  threadId: string
) {
  return `/discussions/${gearSlug}/${lowerGearSlug}/${threadId}`;
}

/** DOM id for a reply row — use with `discussionThreadReplyHref` for deep links. */
export function discussionReplyAnchorId(replyId: string) {
  return `discussion-reply-${replyId}`;
}

export function discussionThreadReplyHref(
  gearSlug: string,
  lowerGearSlug: string,
  threadId: string,
  replyId: string
) {
  return `${discussionThreadPath(gearSlug, lowerGearSlug, threadId)}#${discussionReplyAnchorId(replyId)}`;
}
