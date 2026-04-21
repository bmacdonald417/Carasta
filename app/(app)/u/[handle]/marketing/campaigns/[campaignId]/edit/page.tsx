import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import {
  getCampaignForSellerEdit,
  getSellerAuctionOptions,
} from "@/lib/marketing/get-seller-campaigns";
import { CampaignForm } from "@/components/marketing/campaign-form";
import { CampaignDeleteButton } from "@/components/marketing/campaign-delete-button";

export default async function EditMarketingCampaignPage({
  params,
}: {
  params: Promise<{ handle: string; campaignId: string }>;
}) {
  if (!isMarketingEnabled()) notFound();

  const { handle, campaignId } = await params;
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user) notFound();
  if ((session?.user as any)?.id !== user.id) notFound();

  const [campaign, auctions] = await Promise.all([
    getCampaignForSellerEdit(campaignId, user.id),
    getSellerAuctionOptions(user.id),
  ]);
  if (!campaign) notFound();

  return (
    <div className="carasta-container max-w-xl py-8">
      <Link
        href={`/u/${user.handle}/marketing/campaigns`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All campaigns
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Edit campaign
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{campaign.name}</p>
        </div>
        <CampaignDeleteButton
          handle={user.handle}
          campaignId={campaign.id}
          variant="outline"
          redirectAfterDelete
        />
      </div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <CampaignForm
          handle={user.handle}
          mode="edit"
          auctions={auctions}
          campaign={{
            id: campaign.id,
            name: campaign.name,
            auctionId: campaign.auctionId,
            type: campaign.type,
            status: campaign.status,
            startAt: campaign.startAt,
            endAt: campaign.endAt,
          }}
        />
      </div>
    </div>
  );
}
