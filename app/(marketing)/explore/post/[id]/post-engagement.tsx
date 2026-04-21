"use client";

import type { DiscussionReactionKind } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PostReactionPicker } from "@/components/carmunity/PostReactionPicker";
import { ShareButtons } from "@/components/ui/share-buttons";
import type { DiscussionReactionTotals } from "@/lib/forums/forum-service";

function applyViewerReactionChange(
  summary: DiscussionReactionTotals,
  prevKind: DiscussionReactionKind | null,
  nextKind: DiscussionReactionKind | null
): DiscussionReactionTotals {
  const byKind = { ...summary.byKind } as Partial<Record<DiscussionReactionKind, number>>;
  let total = summary.total;
  if (prevKind) {
    const cur = (byKind[prevKind] ?? 0) - 1;
    if (cur <= 0) delete byKind[prevKind];
    else byKind[prevKind] = cur;
    total -= 1;
  }
  if (nextKind) {
    byKind[nextKind] = (byKind[nextKind] ?? 0) + 1;
    total += 1;
  }
  return { total, byKind };
}

export function PostEngagementBar({
  postId,
  title,
  description,
  initialSummary,
  initialKind,
}: {
  postId: string;
  title: string;
  description?: string | null;
  initialSummary: DiscussionReactionTotals;
  initialKind: DiscussionReactionKind | null;
}) {
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [kind, setKind] = useState(initialKind);

  useEffect(() => {
    setSummary(initialSummary);
    setKind(initialKind);
  }, [initialSummary, initialKind]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
      <PostReactionPicker
        postId={postId}
        summary={summary}
        initialKind={kind}
        onReactionApplied={({ prevKind, nextKind }) => {
          setKind(nextKind);
          setSummary((s) => applyViewerReactionChange(s, prevKind, nextKind));
          router.refresh();
        }}
      />
      <ShareButtons
        url={`/explore/post/${postId}`}
        title={title}
        description={description ?? undefined}
        triggerClassName="border-border bg-muted/40 text-xs text-foreground hover:bg-muted/60"
        carmunityShareMeta={{ surface: "explore_post", postId }}
      />
    </div>
  );
}
