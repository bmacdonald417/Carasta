import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";
import { ConversationClient } from "./conversation-client";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await getSession();
  const reviewCtx = isReviewModeEnabled() ? await getReviewModeContext() : null;
  if (!session?.user?.id && !reviewCtx) redirect("/auth/sign-in");
  const viewerId = ((session?.user as any)?.id as string | undefined) ?? reviewCtx?.sellerUserId;

  const { conversationId } = await params;
  if (!conversationId || !viewerId) redirect("/messages");

  return (
    <div className="carasta-container max-w-3xl py-6">
      <ConversationClient conversationId={conversationId} viewerId={viewerId} />
    </div>
  );
}

