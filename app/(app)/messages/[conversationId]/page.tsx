import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { ConversationClient } from "./conversation-client";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");
  const viewerId = (session.user as { id?: string }).id as string;

  const { conversationId } = await params;
  if (!conversationId || !viewerId) redirect("/messages");

  return (
    <div className="carasta-container max-w-3xl py-6 md:max-w-4xl">
      <ConversationClient conversationId={conversationId} viewerId={viewerId} />
    </div>
  );
}

