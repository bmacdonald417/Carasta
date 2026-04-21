import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { isReviewModeEnabled } from "@/lib/review-mode";
import { MessagesConversationsClient } from "./messages-conversations-client";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session?.user?.id && !isReviewModeEnabled()) redirect("/auth/sign-in");

  return (
    <div className="carasta-container max-w-3xl py-8">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
        Messages
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Private 1:1 conversations. No attachments yet.
      </p>
      <div className="mt-6">
        <MessagesConversationsClient />
      </div>
    </div>
  );
}

