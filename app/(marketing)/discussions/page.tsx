import type { Metadata } from "next";
import Link from "next/link";

import { listForumSpaces } from "@/lib/forums/forum-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discussions",
  description:
    "Browse Carmunity Discussions by Gear and Lower Gear — unified profiles, reactions, and community on Carmunity by Carasta.",
};

export default async function DiscussionsPage() {
  let spaces: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    sortOrder: number;
    categoryCount: number;
  }> = [];
  let loadError: string | null = null;

  try {
    const result = await listForumSpaces();
    if (result.ok) {
      spaces = result.spaces;
    }
  } catch {
    loadError =
      "We couldn’t load discussions right now. Please try again later.";
  }

  return (
    <div className="carasta-container max-w-3xl py-8">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
        Discussions
      </h1>
      <p className="mt-1 text-neutral-400">
        Reddit-style threads with a premium automotive lens — organized as{" "}
        <span className="text-primary">Gears</span> (top-level) and{" "}
        <span className="text-primary">Lower Gears</span> (sub-topics). One
        Carmunity identity: every <span className="text-neutral-200">@handle</span>{" "}
        links to the same <span className="text-neutral-200">/u/[handle]</span>{" "}
        profile.
      </p>

      <div className="mt-8 space-y-3">
        {loadError ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300">
            {loadError}
          </p>
        ) : spaces.length === 0 ? (
          <p className="rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
            No Gears are active yet. Run <code className="text-primary/90">prisma db seed</code>{" "}
            after <code className="text-primary/90">db push</code> to load taxonomy.
          </p>
        ) : (
          spaces.map((s) => (
            <Link
              key={s.id}
              href={`/discussions/${s.slug}`}
              className="block rounded-2xl border border-border/50 bg-card/50 px-4 py-4 shadow-glass-sm transition hover:border-primary/35 hover:bg-muted/10"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                Gear
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold uppercase tracking-wide text-neutral-100">
                {s.title}
              </h2>
              {s.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {s.categoryCount} Lower Gear{s.categoryCount === 1 ? "" : "s"} · slug{" "}
                <code className="text-neutral-300">{s.slug}</code>
              </p>
            </Link>
          ))
        )}
      </div>

      <p className="mt-10 text-sm text-neutral-500">
        <Link href="/explore" className="text-primary hover:underline">
          ← Carmunity feed
        </Link>
      </p>
    </div>
  );
}
