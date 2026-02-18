import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowButton } from "./follow-button";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const session = await getSession();
  const currentUserId = (session?.user as any)?.id;

  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
          garageCars: true,
          auctions: true,
          bids: true,
        },
      },
    },
  });

  if (!user) notFound();

  const isOwnProfile = currentUserId === user.id;
  const following = currentUserId
    ? await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      })
    : null;

  const auctionsParticipated = await prisma.bid.findMany({
    where: { bidderId: user.id },
    select: { auctionId: true },
    distinct: ["auctionId"],
  });

  const soldAuctions = await prisma.auction.findMany({
    where: { status: "SOLD" },
    include: {
      bids: { orderBy: { amountCents: "desc" }, take: 1 },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
  const wonAuctions = soldAuctions.filter(
    (a) => a.bids[0]?.bidderId === user.id
  );

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-2xl border border-border/50 bg-card/80 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatarUrl ?? user.image ?? undefined} />
            <AvatarFallback className="text-2xl">
              {(user.name ?? user.handle).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display text-2xl font-bold">@{user.handle}</h1>
            {user.name && (
              <p className="text-muted-foreground">{user.name}</p>
            )}
            {user.location && (
              <p className="text-sm text-muted-foreground">{user.location}</p>
            )}
            {user.bio && (
              <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>
            )}
            {!isOwnProfile && currentUserId && (
              <FollowButton
                targetUserId={user.id}
                initialFollowing={!!following}
                className="mt-4"
              />
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="font-display text-xl font-semibold">
              {user._count.followers}
            </p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="font-display text-xl font-semibold">
              {user._count.following}
            </p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="font-display text-xl font-semibold">
              {auctionsParticipated.length}
            </p>
            <p className="text-xs text-muted-foreground">Auctions</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="font-display text-xl font-semibold">
              {user._count.garageCars}
            </p>
            <p className="text-xs text-muted-foreground">Garage</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/u/${user.handle}/garage`}>Garage</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/u/${user.handle}/dream`}>Dream Garage</Link>
          </Button>
        </div>

        {wonAuctions.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold">Won Auctions</h2>
            <p className="text-sm text-muted-foreground">
              Auctions won by @{user.handle}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {wonAuctions.map((a) => (
                <Link key={a.id} href={`/auctions/${a.id}`}>
                  <div className="flex gap-4 rounded-xl border border-neutral-200 p-4 transition hover:bg-neutral-50">
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {a.images[0]?.url ? (
                        <Image
                          src={a.images[0].url}
                          alt={a.title}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium line-clamp-1">{a.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.year} {a.make} {a.model}
                      </p>
                      <p className="text-sm font-semibold text-[hsl(var(--performance-red))]">
                        Won at ${((a.bids[0]?.amountCents ?? 0) / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
