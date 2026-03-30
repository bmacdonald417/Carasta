import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getSellerAuctionOptions } from "@/lib/marketing/get-seller-campaigns";
import { CampaignForm } from "@/components/marketing/campaign-form";

export default async function NewMarketingCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ auctionId?: string }>;
}) {
  if (!isMarketingEnabled()) notFound();

  const { handle } = await params;
  const sp = await searchParams;
  const preselectAuctionId =
    typeof sp.auctionId === "string" && sp.auctionId ? sp.auctionId : undefined;
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user) notFound();
  if ((session?.user as any)?.id !== user.id) notFound();

  const auctions = await getSellerAuctionOptions(user.id);

  return (
    <div className="carasta-container max-w-xl py-8">
      <Link
        href={`/u/${user.handle}/marketing/campaigns`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All campaigns
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold text-neutral-100">
        New campaign
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Attach a campaign to one of your listings to keep work organized.
      </p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <CampaignForm
          handle={user.handle}
          mode="create"
          auctions={auctions}
          defaultAuctionId={preselectAuctionId}
        />
      </div>
    </div>
  );
}
