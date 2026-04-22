import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { isReviewModeEnabled } from "@/lib/review-mode";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
import { MessagesConversationsClient } from "./messages-conversations-client";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session?.user?.id && !isReviewModeEnabled()) redirect("/auth/sign-in");

  return (
    <div className="carasta-container max-w-3xl py-8">
      <header className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Messages
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Private 1:1 conversations tied to your account. Attachments are not
          supported yet.
        </p>
      </header>
      <ContextualHelpCard context="product.messages" className="mt-5" />
      <div className="mt-6">
        <MessagesConversationsClient />
      </div>
    </div>
  );
}

