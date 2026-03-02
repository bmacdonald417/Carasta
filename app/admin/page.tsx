import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Gavel, Users, DollarSign, Flag } from "lucide-react";

async function getAdminStats() {
  const [auctionCount, userCount, bidStats, liveAuctions] = await Promise.all([
    prisma.auction.count(),
    prisma.user.count(),
    prisma.bid.aggregate({
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.auction.findMany({
      where: { status: "LIVE" },
      take: 10,
      include: {
        seller: { select: { handle: true } },
        _count: { select: { bids: true } },
      },
      orderBy: { endAt: "asc" },
    }),
  ]);

  const totalBidVolume = bidStats._sum.amountCents ?? 0;
  const totalBids = bidStats._count;

  return {
    auctionCount,
    userCount,
    totalBidVolume,
    totalBids,
    liveAuctions,
  };
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="carasta-container py-8">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#ff3b5c]/20 p-2">
              <Gavel className="h-5 w-5 text-[#ff3b5c]" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Auctions</p>
              <p className="text-2xl font-semibold text-neutral-100">
                {stats.auctionCount}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#ff3b5c]/20 p-2">
              <Users className="h-5 w-5 text-[#ff3b5c]" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Users</p>
              <p className="text-2xl font-semibold text-neutral-100">
                {stats.userCount}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#CCFF00]/20 p-2">
              <DollarSign className="h-5 w-5 text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Bid Volume</p>
              <p className="text-2xl font-semibold text-neutral-100">
                {formatCurrency(stats.totalBidVolume)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#CCFF00]/20 p-2">
              <Flag className="h-5 w-5 text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Bids</p>
              <p className="text-2xl font-semibold text-neutral-100">
                {stats.totalBids}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live auctions table */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-neutral-100">
          Live Auctions
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Manage and moderate active listings
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Listing
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Seller
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Bids
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Ends
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.liveAuctions.map((a) => (
                <tr
                  key={a.id}
                  className="transition hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/auctions/${a.id}`}
                      className="font-medium text-[#ff3b5c] hover:underline"
                    >
                      {a.year} {a.make} {a.model}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    @{a.seller.handle}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {a._count.bids}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {new Date(a.endAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/auctions/${a.id}`}
                      className="text-sm text-[#ff3b5c] hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.liveAuctions.length === 0 && (
            <div className="py-12 text-center text-neutral-500">
              No live auctions at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
