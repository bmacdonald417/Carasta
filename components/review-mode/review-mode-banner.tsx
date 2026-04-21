import Link from "next/link";

import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";

export async function ReviewModeBanner() {
  if (!isReviewModeEnabled()) return null;

  const ctx = await getReviewModeContext();
  if (!ctx) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="carasta-container flex flex-col gap-3 py-3 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold uppercase tracking-[0.18em] text-amber-800">
            Review Mode
          </p>
          <p className="mt-1 max-w-3xl leading-6">
            Temporary pre-launch review access is enabled. Surfaces may expose
            demo content or seeded data and this mode should be removable later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/review"
            className="rounded-full border border-amber-300 bg-white px-3 py-1.5 font-semibold transition hover:bg-amber-100"
          >
            Review hub
          </Link>
          {ctx.previewAuctionId ? (
            <Link
              href={`/u/${ctx.sellerHandle}/marketing/auctions/${ctx.previewAuctionId}`}
              className="rounded-full border border-amber-300 bg-white px-3 py-1.5 font-semibold transition hover:bg-amber-100"
            >
              Demo marketing
            </Link>
          ) : null}
          {ctx.previewThreadPath ? (
            <Link
              href={ctx.previewThreadPath}
              className="rounded-full border border-amber-300 bg-white px-3 py-1.5 font-semibold transition hover:bg-amber-100"
            >
              Demo discussion
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
