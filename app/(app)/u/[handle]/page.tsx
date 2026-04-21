import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowButton } from "./follow-button";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { TrustPanel } from "@/components/profile/TrustPanel";
import { ReputationBadge } from "@/components/reputation/ReputationBadge";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { ProfilePostPreview } from "@/components/profile/ProfilePostPreview";
import { ProfileGaragePreviewGrid } from "@/components/profile/ProfileGaragePreviewGrid";
import { ProfilePostsEmpty } from "@/components/carmunity/ProfilePostsEmpty";
import { ProfileCarmunitySetupStrip } from "@/components/profile/ProfileCarmunitySetupStrip";
import { ShareButtons } from "@/components/ui/share-buttons";
import { DemoProfileBanner } from "@/components/discussions/DemoProfileBanner";
import { DiscussionAuthorBadges } from "@/components/discussions/DiscussionAuthorBadges";
import { DiscussionPeerSafetyMenu } from "@/components/discussions/DiscussionPeerSafetyMenu";
import { CarmunityActivitySection } from "@/components/profile/CarmunityActivitySection";
import type { CarmunityActivityItem } from "@/components/profile/CarmunityActivitySection";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { listProfileDiscussionActivityPage } from "@/lib/forums/profile-discussion-activity";
import { listSavedThreadsForUser, savedThreadHref } from "@/lib/forums/thread-subscriptions";
import { getPublicSiteOrigin } from "@/lib/marketing/site-origin";
import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
    select: { handle: true, name: true, bio: true, avatarUrl: true, image: true },
  });
  if (!user) return { title: "Profile" };
  const origin = getPublicSiteOrigin();
  const path = `/u/${encodeURIComponent(user.handle)}`;
  const display = user.name?.trim() || `@${user.handle}`;
  const title = user.name?.trim() ? `${user.name} (@${user.handle})` : `@${user.handle}`;
  const description =
    user.bio?.replace(/\s+/g, " ").trim().slice(0, 180) ||
    `Garage, posts, and discussions for ${display} on Carmunity by Carasta.`;
  const rawImg = user.avatarUrl?.trim() || user.image?.trim();
  const ogImages =
    rawImg != null && rawImg.length > 0
      ? [rawImg.startsWith("http") ? rawImg : `${origin}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`]
      : undefined;
  return {
    title,
    description,
    alternates: { canonical: `${origin}${path}` },
    openGraph: {
      title,
      description,
      url: `${origin}${path}`,
      siteName: "Carmunity by Carasta",
      type: "profile",
      images: ogImages,
    },
    twitter: {
      card: ogImages ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImages,
    },
  };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ activityPage?: string }>;
}) {
  const { handle } = await params;
  const sp = (await searchParams) ?? {};
  const session = await getSession();
  const reviewCtx = isReviewModeEnabled() ? await getReviewModeContext() : null;
  const currentUserId = (session?.user as any)?.id;

  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
    select: {
      id: true,
      handle: true,
      name: true,
      avatarUrl: true,
      image: true,
      bio: true,
      location: true,
      instagramUrl: true,
      facebookUrl: true,
      twitterUrl: true,
      tiktokUrl: true,
      collectorTier: true,
      isDemoSeed: true,
      userBadges: {
        orderBy: { awardedAt: "desc" },
        take: 10,
        select: {
          badge: { select: { slug: true, name: true } },
        },
      },
      reputationScore: true,
      completedSalesCount: true,
      completedPurchasesCount: true,
      disputesLostCount: true,
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

  const isOwnProfile =
    currentUserId === user.id ||
    (reviewCtx?.profileHandle === user.handle.toLowerCase());
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

  const [recentPosts, garagePreviewCars] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        content: true,
        imageUrl: true,
        auctionId: true,
        createdAt: true,
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.garageCar.findMany({
      where: { ownerId: user.id, type: "GARAGE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      },
    }),
  ]);

  const wonAuctions = await prisma.auction.findMany({
    where: {
      status: "SOLD",
      OR: [
        { buyerId: user.id },
        { bids: { some: { bidderId: user.id } } },
      ],
    },
    include: {
      bids: { orderBy: { amountCents: "desc" }, take: 1 },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
  const wonAuctionsFiltered = wonAuctions.filter(
    (a) => a.buyerId === user.id || a.bids[0]?.bidderId === user.id
  );

  const profileBadges = user.userBadges.map((ub) => ({
    slug: ub.badge.slug,
    name: ub.badge.name,
  }));

  const activityPage = Math.max(1, Number(sp.activityPage) || 1);

  const [blockRow, muteRow] =
    currentUserId && !isOwnProfile
      ? await Promise.all([
          prisma.userBlock.findUnique({
            where: {
              blockerId_blockedId: { blockerId: currentUserId, blockedId: user.id },
            },
            select: { id: true },
          }),
          prisma.userMute.findUnique({
            where: {
              userId_mutedUserId: { userId: currentUserId, mutedUserId: user.id },
            },
            select: { id: true },
          }),
        ])
      : [null, null];

  const viewerBlocksProfile = Boolean(blockRow);

  const activity = viewerBlocksProfile
    ? { items: [], hasNextPage: false, page: activityPage }
    : await listProfileDiscussionActivityPage({
        userId: user.id,
        page: activityPage,
        take: 15,
      });

  const activityItems: CarmunityActivityItem[] = activity.items.map((row) => {
    if (row.kind === "thread") {
      return {
        kind: "thread" as const,
        at: row.at.toISOString(),
        title: row.title,
        href: discussionThreadPath(row.gearSlug, row.lowerGearSlug, row.id),
      };
    }
    return {
      kind: "reply" as const,
      at: row.at.toISOString(),
      excerpt: row.body.replace(/\s+/g, " ").trim().slice(0, 220),
      threadTitle: row.threadTitle,
      href: discussionThreadPath(row.gearSlug, row.lowerGearSlug, row.threadId),
    };
  });

  const activityNextHref = activity.hasNextPage
    ? `/u/${encodeURIComponent(user.handle)}?activityPage=${activityPage + 1}`
    : null;

  const savedThreads =
    isOwnProfile && currentUserId
      ? await listSavedThreadsForUser({ prisma, userId: user.id, take: 12 })
      : [];

  const displayName = user.name?.trim() || `@${user.handle}`;
  const garageTiles = garagePreviewCars.map((c) => ({
    id: c.id,
    year: c.year,
    make: c.make,
    model: c.model,
    imageUrl: c.images[0]?.url ?? null,
  }));

  return (
    <div className="carasta-container max-w-3xl space-y-8 py-10 pb-16">
      {user.isDemoSeed ? <DemoProfileBanner /> : null}
      {/* 1 — Profile header */}
      <section className="carmunity-profile-enter overflow-hidden rounded-2xl border border-border bg-card shadow-e1">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:gap-8">
          <Avatar className="mx-auto h-28 w-28 shrink-0 border-2 border-border sm:mx-0 sm:h-32 sm:w-32">
            <AvatarImage src={user.avatarUrl ?? user.image ?? undefined} alt="" />
            <AvatarFallback className="text-2xl font-semibold">
              {(user.name ?? user.handle).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Carmunity
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {displayName}
              </h1>
              <ReputationBadge tier={user.collectorTier} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">@{user.handle}</p>
            <DiscussionAuthorBadges
              badges={profileBadges}
              className="mt-2 flex justify-center sm:justify-start"
            />
            {user.location ? (
              <p className="mt-1 text-xs text-muted-foreground">{user.location}</p>
            ) : null}
            {user.bio ? (
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground">{user.bio}</p>
            ) : null}

            <div className="mt-4 flex justify-center sm:justify-start">
              <SocialLinks
                instagramUrl={user.instagramUrl}
                facebookUrl={user.facebookUrl}
                twitterUrl={user.twitterUrl}
                tiktokUrl={user.tiktokUrl}
              />
            </div>
          </div>
        </div>

        {/* Stats — identity hub: posts + social first */}
        <div className="grid grid-cols-3 border-t border-border bg-muted/20 sm:grid-cols-6">
          {(
            [
              { label: "Posts", value: user._count.posts, href: null as string | null },
              {
                label: "Followers",
                value: user._count.followers,
                href: `/u/${encodeURIComponent(user.handle)}/followers`,
              },
              {
                label: "Following",
                value: user._count.following,
                href: `/u/${encodeURIComponent(user.handle)}/following`,
              },
              { label: "Garage", value: user._count.garageCars, href: null },
              { label: "Listings", value: user._count.auctions, href: null },
              { label: "Bids", value: user._count.bids, href: null },
            ] as const
          ).map((s) => (
            <div
              key={s.label}
              className="border-border/40 px-2 py-4 text-center sm:border-r sm:border-border sm:last:border-r-0"
            >
              {s.href ? (
                <Link
                  href={s.href}
                  className={cn(
                    "-m-2 block rounded-lg px-2 py-2 transition-colors hover:bg-muted/40",
                    shellFocusRing
                  )}
                >
                  <p className="text-lg font-semibold tabular-nums text-foreground sm:text-xl">{s.value}</p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-primary sm:text-xs">
                    {s.label}
                  </p>
                </Link>
              ) : (
                <>
                  <p className="text-lg font-semibold tabular-nums text-foreground sm:text-xl">{s.value}</p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                    {s.label}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2 — Action row */}
      <section className="flex flex-wrap items-center gap-2">
        <ShareButtons
          url={`/u/${encodeURIComponent(user.handle)}`}
          title={`${displayName} · @${user.handle}`}
          description={
            user.bio?.replace(/\s+/g, " ").trim().slice(0, 140) ||
            `Carmunity profile — garage, posts, and discussions.`
          }
          triggerClassName="border-border bg-muted/40 text-xs text-foreground hover:bg-muted/60"
          carmunityShareMeta={
            currentUserId
              ? { surface: "profile", profileUserId: user.id, handle: user.handle }
              : undefined
          }
        />
        {!isOwnProfile && currentUserId ? (
          <FollowButton targetUserId={user.id} initialFollowing={!!following} />
        ) : null}
        {!isOwnProfile && currentUserId ? (
          <DiscussionPeerSafetyMenu
            targetUserId={user.id}
            targetHandle={user.handle}
            initialBlocked={viewerBlocksProfile}
            initialMuted={Boolean(muteRow)}
          />
        ) : null}
        {isOwnProfile ? (
          <>
            <Button variant="outline" size="sm" asChild className={cn("border-border", shellFocusRing)}>
              <Link href="/explore">Open Carmunity</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className={cn("border-border", shellFocusRing)}>
              <Link href="/settings">Settings</Link>
            </Button>
          </>
        ) : null}
        <Button variant="outline" size="sm" asChild className={cn("border-border", shellFocusRing)}>
          <Link href={`/u/${user.handle}/garage`}>Garage</Link>
        </Button>
        <Button variant="outline" size="sm" asChild className={cn("border-border", shellFocusRing)}>
          <Link href={`/u/${user.handle}/dream`}>Dream garage</Link>
        </Button>
        <Button variant="outline" size="sm" asChild className={cn("border-border", shellFocusRing)}>
          <Link href={`/u/${user.handle}/listings`}>Listings</Link>
        </Button>
        {isOwnProfile && isMarketingEnabled() ? (
          <Button variant="outline" size="sm" asChild className={cn("border-border", shellFocusRing)}>
            <Link href={`/u/${user.handle}/marketing`}>Marketing</Link>
          </Button>
        ) : null}
      </section>

      <CarmunityActivitySection
        items={activityItems}
        handle={user.handle}
        page={activityPage}
        hasNextPage={activity.hasNextPage}
        nextPageHref={activityNextHref}
      />

      {isOwnProfile &&
      user._count.posts === 0 &&
      user._count.garageCars === 0 &&
      activityItems.length === 0 ? (
        <ProfileCarmunitySetupStrip handle={user.handle} />
      ) : null}

      {isOwnProfile ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Saved discussions</h2>
            <p className="text-sm text-muted-foreground">
              Threads you saved for quick return — same as &quot;Save thread&quot; in discussions.
            </p>
          </div>
          {savedThreads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center shadow-e1">
              <p className="text-base font-semibold text-foreground">Saved threads are your reading list</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                When a build thread or tech debate deserves a bookmark, tap{" "}
                <span className="font-medium text-primary">Save thread</span> — we’ll surface light
                activity hints here when there’s fresh discussion.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="sm" className={cn(shellFocusRing)}>
                  <Link href="/discussions">Browse discussions</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className={cn("border-border", shellFocusRing)}>
                  <Link href="/explore?tab=following">Open Following feed</Link>
                </Button>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {savedThreads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={savedThreadHref(t)}
                    className={cn(
                      "relative block rounded-xl border border-border bg-card px-4 py-3 shadow-e1 transition-colors hover:border-primary/30 hover:bg-muted/30",
                      shellFocusRing
                    )}
                  >
                    {t.hasNewActivity ? (
                      <span
                        className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/30"
                        title="New activity since you last opened this thread"
                        aria-hidden
                      />
                    ) : null}
                    <p className="pr-6 font-medium text-foreground line-clamp-2">{t.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.gearSlug} / {t.lowerGearSlug} · last activity{" "}
                      {t.lastActivityAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {isOwnProfile ? (
        <section className="rounded-2xl border border-border bg-muted/20 px-4 py-5 shadow-e1">
          <h2 className="text-sm font-semibold text-foreground">Following activity</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use <span className="font-medium text-primary">Carmunity → Following</span> for a unified
            stream of posts plus discussion threads and replies from people you follow.
          </p>
        </section>
      ) : null}

      {/* 3 — Garage spotlight */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Garage</h2>
            <p className="text-sm text-muted-foreground">
              {user._count.garageCars === 0
                ? "Collection portfolio — add cars on the web."
                : `${user._count.garageCars} car${user._count.garageCars === 1 ? "" : "s"} on file`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn("shrink-0 text-primary hover:text-primary", shellFocusRing)}
            asChild
          >
            <Link href={`/u/${user.handle}/garage`}>View all</Link>
          </Button>
        </div>
        <ProfileGaragePreviewGrid handle={user.handle} cars={garageTiles} isOwnProfile={isOwnProfile} />
      </section>

      <TrustPanel
        collectorTier={user.collectorTier}
        reputationScore={user.reputationScore}
        completedSalesCount={user.completedSalesCount}
        completedPurchasesCount={user.completedPurchasesCount}
        disputesLostCount={user.disputesLostCount}
      />

      {/* 4 — Posts (Carmunity card language) */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Posts</h2>
            <p className="text-sm text-muted-foreground">Carmunity updates from @{user.handle}</p>
          </div>
          {recentPosts.length > 0 ? (
            <Button variant="ghost" size="sm" className={cn("shrink-0 text-primary", shellFocusRing)} asChild>
              <Link href="/explore">Explore feed</Link>
            </Button>
          ) : null}
        </div>
        {recentPosts.length === 0 ? (
          <ProfilePostsEmpty isOwnProfile={isOwnProfile} handle={user.handle} />
        ) : (
          <div className="space-y-4">
            {recentPosts.map((p) => (
              <ProfilePostPreview
                key={p.id}
                post={{
                  id: p.id,
                  createdAt: p.createdAt,
                  content: p.content,
                  imageUrl: p.imageUrl,
                  auctionId: p.auctionId,
                  _count: p._count,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {wonAuctionsFiltered.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Won auctions</h2>
          <p className="text-sm text-muted-foreground">Auctions won by @{user.handle}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {wonAuctionsFiltered.map((a) => (
              <Link
                key={a.id}
                href={`/auctions/${a.id}`}
                className={cn("block rounded-xl", shellFocusRing)}
              >
                <div className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-e1 transition-colors hover:border-primary/30 hover:bg-muted/30">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {a.images[0]?.url ? (
                      <Image
                        src={a.images[0].url}
                        alt={a.title}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium line-clamp-1">{a.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.year} {a.make} {a.model}
                    </p>
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      Won at $
                      {(
                        ((a.buyerId ? a.buyNowPriceCents : a.bids[0]?.amountCents) ?? 0) / 100
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
