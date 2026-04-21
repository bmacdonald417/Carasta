import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getMarketingPresetsForUser } from "@/lib/marketing/get-seller-marketing-presets";
import { Button } from "@/components/ui/button";
import { MarketingPresetDeleteButton } from "@/components/marketing/marketing-preset-delete-button";
import { MarketingPresetQueryCopy } from "@/components/marketing/marketing-preset-query-copy";

export default async function MarketingPresetsPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  if (!isMarketingEnabled()) notFound();

  const { handle } = await params;
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user) notFound();
  if ((session?.user as { id?: string } | null)?.id !== user.id) notFound();

  const [presets, exampleAuction] = await Promise.all([
    getMarketingPresetsForUser(user.id),
    prisma.auction.findFirst({
      where: { sellerId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    }),
  ]);

  return (
    <div className="carasta-container max-w-3xl py-8">
      <Link
        href={`/u/${user.handle}/marketing`}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        ← Back to Marketing
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Presets
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            For <span className="text-neutral-300">Share &amp; Promote</span> —
            UTM labels and copy. Nothing posts automatically.
          </p>
        </div>
        <Button asChild variant="performance" size="sm">
          <Link href={`/u/${user.handle}/marketing/presets/new`}>
            New preset
          </Link>
        </Button>
      </div>

      {presets.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
          <p className="font-medium text-neutral-200">No presets yet</p>
          <p className="mt-2 text-sm text-neutral-500">
            Create one to reuse the same campaign tag and caption preferences
            across listings.
          </p>
          <Button className="mt-6" asChild variant="secondary">
            <Link href={`/u/${user.handle}/marketing/presets/new`}>
              Create preset
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {presets.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <div>
                <p className="font-medium text-foreground">{p.name}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {p.source} · {p.medium} · {p.copyVariant.replace("_", " ")}
                  {p.campaignLabel ? ` · campaign: ${p.campaignLabel}` : ""}
                  {p.isDefault ? " · default" : ""}
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                <MarketingPresetQueryCopy
                  handle={user.handle}
                  presetId={p.id}
                  exampleAuctionId={exampleAuction?.id ?? null}
                />
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/u/${user.handle}/marketing/presets/${p.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <MarketingPresetDeleteButton handle={user.handle} presetId={p.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
