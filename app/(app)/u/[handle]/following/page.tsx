import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { peerUserIdsHiddenFromViewer } from "@/lib/user-safety";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  return { title: `@${handle} — Following` };
}

export default async function FollowingPage({ params }: Props) {
  const { handle } = await params;
  const session = await getSession();
  const viewerId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
    select: { id: true, handle: true, name: true },
  });
  if (!user) notFound();

  const rows = await prisma.follow.findMany({
    where: { followerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      following: {
        select: {
          id: true,
          handle: true,
          name: true,
          avatarUrl: true,
          image: true,
        },
      },
    },
  });

  const ids = rows.map((r) => r.following.id);
  const hidden = await peerUserIdsHiddenFromViewer(prisma, viewerId, ids);
  const visible = rows.filter((r) => !hidden.has(r.following.id));

  return (
    <div className="carasta-container max-w-2xl space-y-6 py-10 pb-16">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">Carmunity</p>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-neutral-100">
          Following
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          People @{user.handle}
          {user.name ? ` (${user.name})` : ""} follows.
        </p>
        <Link
          href={`/u/${encodeURIComponent(user.handle)}`}
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          ← Back to profile
        </Link>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-border/50 bg-card/40 px-4 py-6 text-sm text-muted-foreground">
          Not following anyone yet, or no accounts to show.
        </p>
      ) : (
        <ul className="divide-y divide-white/5 rounded-2xl border border-border/50 bg-card/40">
          {visible.map(({ following: f }) => (
            <li key={f.id}>
              <Link
                href={`/u/${encodeURIComponent(f.handle)}`}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-muted/15"
              >
                <Avatar className="h-10 w-10 border border-white/10">
                  <AvatarImage src={f.avatarUrl ?? f.image ?? undefined} alt="" />
                  <AvatarFallback className="text-xs">
                    {(f.name ?? f.handle).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-100">
                    {f.name?.trim() || `@${f.handle}`}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">@{f.handle}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
