/**
 * Read-only: counts feedback rows pending/reviewed (production or any DATABASE_URL).
 * Does not mutate. Exits 0 always unless Prisma client fails to connect.
 *
 *   npx ts-node -P tsconfig.scripts.json scripts/feedback-agent-status.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("NO_DATABASE_URL: set DATABASE_URL (e.g. Railway Postgres) to query feedback.");
    return;
  }

  try {
    const rows = await prisma.$queryRaw<{ c: bigint }[]>`
      SELECT COUNT(*)::bigint AS c
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'feedback'
    `;
    const exists = Number(rows[0]?.c ?? 0) > 0;
    if (!exists) {
      console.log("NO_TABLE: public.feedback — see CARASTA_FEEDBACK_AGENT.md for optional DDL.");
      return;
    }

    const pending = await prisma.$queryRaw<{ c: bigint }[]>`
      SELECT COUNT(*)::bigint AS c FROM feedback WHERE status IN ('pending', 'reviewed')
    `;
    const n = Number(pending[0]?.c ?? 0);
    console.log(`FEEDBACK_PENDING_OR_REVIEWED_COUNT=${n}`);
    if (n === 0) {
      console.log("ZERO_ITEMS: no drain commit needed.");
    }
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "42P01") {
      console.log("NO_TABLE: feedback");
      return;
    }
    console.error(e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
