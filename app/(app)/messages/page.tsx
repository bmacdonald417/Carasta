import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { MessagesLayout } from "./messages-layout";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ with?: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const viewerId = (session.user as { id: string }).id;
  const viewerHandle = (session.user as { handle?: string }).handle ?? null;
  const viewerName = session.user.name ?? null;
  const viewerAvatar = (session.user as { avatarUrl?: string }).avatarUrl ?? session.user.image ?? null;

  const sp = searchParams ? await searchParams : {};
  const withHandle = typeof sp.with === "string" ? sp.with : null;

  return (
    <MessagesLayout
      viewerId={viewerId}
      viewerHandle={viewerHandle}
      viewerName={viewerName}
      viewerAvatar={viewerAvatar}
      initialWithHandle={withHandle}
    />
  );
}
