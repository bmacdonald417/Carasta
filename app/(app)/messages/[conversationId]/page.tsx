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
    <div className="flex h-[calc(100dvh-3.75rem)] overflow-hidden">
      <ConversationClient conversationId={conversationId} viewerId={viewerId} />
    </div>
  );
}
