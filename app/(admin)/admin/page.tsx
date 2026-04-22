import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Gavel, Users, DollarSign, Flag, Megaphone } from "lucide-react";

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

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string | number;
  icon: typeof Gavel;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-e1">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="carasta-container py-8 md:py-10">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Admin dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Operational overview, moderation entry points, and live listing visibility. Internal tooling
          uses the same light-first surfaces as the rest of the product.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total auctions"
          value={stats.auctionCount}
          icon={Gavel}
          iconClass="bg-primary/10 text-primary"
        />
        <StatCard
          label="Total users"
          value={stats.userCount}
          icon={Users}
          iconClass="bg-muted text-foreground"
        />
        <StatCard
          label="Bid volume"
          value={formatCurrency(stats.totalBidVolume)}
          icon={DollarSign}
          iconClass="bg-success/10 text-success"
        />
        <StatCard
          label="Total bids"
          value={stats.totalBids}
          icon={Flag}
          iconClass="bg-info-soft text-info-foreground"
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/moderation/discussions"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-e1 transition-colors hover:border-primary/30 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <Flag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Discussion reports</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review user-submitted Discussions reports (read-only queue).
            </p>
          </div>
        </Link>

        <Link
          href="/admin/marketing"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-e1 transition-colors hover:border-primary/30 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="rounded-lg bg-info-soft p-3 text-info-foreground">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Marketing summary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Platform-wide traffic events, rollups, campaigns, and marketing notifications — read-only.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Reputation debug</h2>
        <p className="mt-1 text-sm text-muted-foreground">View reputation events by handle.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Click a seller handle in the table below to view their reputation events.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Live auctions</h2>
        <p className="mt-1 text-sm text-muted-foreground">Active listings ending soonest first.</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-e1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Listing
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Seller
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bids
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Ends
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.liveAuctions.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/auctions/${a.id}`}
                      className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {a.year} {a.make} {a.model}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link
                      href={`/admin/reputation/${a.seller.handle}`}
                      className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      @{a.seller.handle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{a._count.bids}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(a.endAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/auctions/${a.id}`}
                      className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.liveAuctions.length === 0 && (
            <div className="border-t border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
              No live auctions at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
