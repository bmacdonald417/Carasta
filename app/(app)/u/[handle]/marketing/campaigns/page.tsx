import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getAllSellerCampaigns } from "@/lib/marketing/get-seller-campaigns";
import { formatMarketingDate } from "@/lib/marketing/marketing-display";
import { CampaignStatusBadge } from "@/components/marketing/campaign-status-badge";
import { campaignTypeLabel } from "@/components/marketing/campaign-type-label";
import { CampaignDeleteButton } from "@/components/marketing/campaign-delete-button";
import { Button } from "@/components/ui/button";
import { MarketingCampaignStatus } from "@prisma/client";

export default async function MarketingCampaignsPage({
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
  if ((session?.user as any)?.id !== user.id) notFound();

  const campaigns = await getAllSellerCampaigns(user.id);

  return (
    <div className="carasta-container max-w-5xl py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/u/${user.handle}/marketing`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Back to Marketing
          </Link>
          <h1 className="mt-3 font-display text-2xl font-bold text-neutral-100">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track promotion work per listing — no auto-post or email from here.
          </p>
        </div>
        <Button asChild className="bg-[#ff3b5c] hover:bg-[#ff3b5c]/90">
          <Link href={`/u/${user.handle}/marketing/campaigns/new`}>
            New campaign
          </Link>
        </Button>
      </div>
      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
          <p className="font-medium text-neutral-200">No campaigns yet</p>
          <p className="mt-2 text-sm text-neutral-500">
            Create a campaign to track how you&apos;re promoting a listing — use
            it alongside Share &amp; Promote on your auction marketing page.
          </p>
          <Button className="mt-6" asChild variant="secondary">
            <Link href={`/u/${user.handle}/marketing/campaigns/new`}>
              Create campaign
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-xs font-medium uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((c) => (
                <tr key={c.id} className="text-neutral-300">
                  <td className="px-4 py-3 font-medium text-neutral-100">
                    {c.name}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-neutral-400">
                    {c.auctionTitle}
                  </td>
                  <td className="px-4 py-3">{campaignTypeLabel(c.type)}</td>
                  <td className="px-4 py-3">
                    <CampaignStatusBadge
                      status={c.status as MarketingCampaignStatus}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                    {c.startAt || c.endAt ? (
                      <>
                        {c.startAt ? formatMarketingDate(c.startAt) : "—"} →{" "}
                        {c.endAt ? formatMarketingDate(c.endAt) : "—"}
                      </>
                    ) : (
                      <span className="text-neutral-600">
                        Added {formatMarketingDate(c.createdAt)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/u/${user.handle}/marketing/auctions/${c.auctionId}`}
                        >
                          Listing
                        </Link>
                      </Button>
                      <Button variant="secondary" size="sm" asChild>
                        <Link
                          href={`/u/${user.handle}/marketing/campaigns/${c.id}/edit`}
                        >
                          Edit
                        </Link>
                      </Button>
                      <CampaignDeleteButton handle={user.handle} campaignId={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
