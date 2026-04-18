import Link from "next/link";
import { getLeaderboardData } from "@/lib/leaderboard";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const rows = await getLeaderboardData(50);

  return (
    <div className="carasta-container max-w-4xl py-8">
      <Link
        href="/explore"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Carmunity
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
        Leaderboard
      </h1>
      <p className="mt-1 text-muted-foreground">
        Top collectors by reputation, cars sold, and highest purchase.
      </p>
      <div className="mt-8">
        <LeaderboardTable rows={rows} />
      </div>
    </div>
  );
}
