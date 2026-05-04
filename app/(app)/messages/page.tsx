import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
import { PageHeader } from "@/components/ui/page-header";
import { MessagesConversationsClient } from "./messages-conversations-client";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  return (
    <div className="carasta-container max-w-3xl py-8">
      <PageHeader
        eyebrow="Carmunity"
        title="Messages"
        subtitle="Private 1:1 conversations tied to your account."
      />
      <ContextualHelpCard context="product.messages" className="mt-5" />
      <div className="mt-6">
        <MessagesConversationsClient />
      </div>
    </div>
  );
}

