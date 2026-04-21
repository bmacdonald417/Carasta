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
    <div className="carasta-container max-w-4xl py-8">
      <Link
        href="/admin"
        className="text-sm text-neutral-400 hover:text-foreground"
      >
        ← Admin
      </Link>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
        <h1 className="font-display text-xl font-semibold">
          Reputation: @{user.handle}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">{user.name ?? "—"}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-neutral-500">Score</p>
            <p className="font-semibold">{user.reputationScore}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Tier</p>
            <p className="font-semibold">{user.collectorTier}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Sales / Purchases</p>
            <p className="font-semibold">
              {user.completedSalesCount} / {user.completedPurchasesCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Disputes Lost</p>
            <p className="font-semibold">{user.disputesLostCount}</p>
          </div>
        </div>
        {user.reputationUpdatedAt && (
          <p className="mt-2 text-xs text-neutral-500">
            Updated: {user.reputationUpdatedAt.toISOString()}
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold">
          Last 50 Reputation Events
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-400">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-400">
                  Points
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-400">
                  Base
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-400">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-400">
                  Meta
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">{e.type}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      e.points >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {e.points >= 0 ? "+" : ""}
                    {e.points}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{e.basePoints}</td>
                  <td className="px-4 py-3 text-neutral-400">
                    {e.createdAt.toISOString()}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-neutral-500">
                    {e.meta ? JSON.stringify(e.meta) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="py-12 text-center text-neutral-500">
              No reputation events yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
