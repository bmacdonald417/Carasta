import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminReputationPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
    select: {
      id: true,
      handle: true,
      name: true,
      reputationScore: true,
      collectorTier: true,
      reputationUpdatedAt: true,
      completedSalesCount: true,
      completedPurchasesCount: true,
      disputesLostCount: true,
    },
  });

  if (!user) notFound();

  const events = await prisma.reputationEvent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="carasta-container max-w-4xl py-8 md:py-10">
      <Link
        href="/admin"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        ← Admin home
      </Link>

      <header className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-e1 md:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Reputation · @{user.handle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.name ?? "—"}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Score</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{user.reputationScore}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tier</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{user.collectorTier}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sales / purchases
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {user.completedSalesCount} / {user.completedPurchasesCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Disputes lost</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{user.disputesLostCount}</p>
          </div>
        </div>
        {user.reputationUpdatedAt ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Updated {user.reputationUpdatedAt.toISOString()}
          </p>
        ) : null}
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Last 50 reputation events</h2>
        <p className="mt-1 text-sm text-muted-foreground">Newest first — read-only debug view.</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-e1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Points
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Base
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Meta
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 text-foreground">{e.type}</td>
                  <td
                    className={`px-4 py-3 font-medium tabular-nums ${
                      e.points >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {e.points >= 0 ? "+" : ""}
                    {e.points}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.basePoints}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{e.createdAt.toISOString()}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-muted-foreground">
                    {e.meta ? JSON.stringify(e.meta) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 ? (
            <div className="border-t border-border px-4 py-12 text-center text-sm text-muted-foreground">
              No reputation events yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
