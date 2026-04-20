import Link from "next/link";

import { getSession } from "@/lib/auth";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { listTrendingThreadsGlobal } from "@/lib/forums/discussions-discovery";
import { CommunityFeed } from "./community-feed";
import { TrendingDreamGarage } from "./TrendingDreamGarage";

type SearchParams = { tab?: string } | Promise<{ tab?: string }>;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const tab = typeof params.tab === "string" ? params.tab : "trending";
  const session = await getSession();
  const currentUserId = (session?.user as any)?.id;

  const trendingThreads = await listTrendingThreadsGlobal({ take: 4 }).catch(() => []);

  return (
    <div className="carasta-container max-w-2xl py-10 pb-16">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
        Carmunity
      </h1>
      <p className="mt-1 text-sm text-neutral-500">by Carasta</p>
      <p className="mt-2 text-neutral-400">
        Feed posts from builders and collectors. Follow people to see them in
        Following — or jump to{" "}
        <Link
          href="/discussions"
          className="carmunity-nav-link text-primary hover:underline"
          data-active="false"
        >
          Discussions
        </Link>{" "}
        for threaded discussions.
      </p>
      <TrendingDreamGarage />
      {trendingThreads.length > 0 ? (
        <section className="mb-10 space-y-3 rounded-2xl border border-border/50 bg-card/40 p-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                Discussions
              </p>
              <h2 className="font-display text-base font-semibold uppercase tracking-wide text-neutral-100">
                Trending in discussions
              </h2>
            </div>
            <Link
              href="/discussions"
              className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
            >
              Browse all
            </Link>
          </div>
          <ul className="divide-y divide-white/5">
            {trendingThreads.map((t) => (
              <li key={t.id}>
                <Link
                  href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                  className="block py-2.5 text-sm text-neutral-200 transition hover:text-primary"
                >
                  <span className="line-clamp-2 font-medium">{t.title}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {t.gearSlug} / {t.lowerGearSlug}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <CommunityFeed tab={tab} currentUserId={currentUserId} />
    </div>
  );
}
