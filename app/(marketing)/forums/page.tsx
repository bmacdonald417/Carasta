import type { Metadata } from "next";
import Link from "next/link";

import { listForumSpaces } from "@/lib/forums/forum-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forums",
  description:
    "Browse Carmunity forum spaces — mechanics, gear, builds, and more on Carmunity by Carasta.",
};

export default async function ForumsPage() {
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
    loadError = "We couldn’t load forums right now. Please try again later.";
  }

  return (
    <div className="carasta-container max-w-3xl py-8">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
        Forums
      </h1>
      <p className="mt-1 text-neutral-400">
        Structured discussions by topic — part of{" "}
        <span className="text-neutral-200">Carmunity by Carasta</span>. Use the
        app for full thread and reply workflows; here you can browse active
        spaces from the same system.
      </p>

      <div className="mt-8 space-y-3">
        {loadError ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300">
            {loadError}
          </p>
        ) : spaces.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-400">
            No forum spaces are active yet. Check back after spaces are seeded
            or enabled in the database.
          </p>
        ) : (
          spaces.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-4"
            >
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-neutral-100">
                {s.title}
              </h2>
              {s.description ? (
                <p className="mt-1 text-sm text-neutral-400">{s.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-neutral-500">
                {s.categoryCount} categor{s.categoryCount === 1 ? "y" : "ies"} ·
                slug <code className="text-neutral-400">{s.slug}</code>
              </p>
            </div>
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
