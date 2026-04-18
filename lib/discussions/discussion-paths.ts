/** Canonical Discussions thread URL (unchanged path shape). */
export function discussionThreadPath(
  gearSlug: string,
  lowerGearSlug: string,
  threadId: string
) {
  return `/discussions/${gearSlug}/${lowerGearSlug}/${threadId}`;
}
