import { prisma } from "@/lib/db";

export type ListingAiRateLimitResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt(String(raw ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Per-user daily cap + cooldown between listing AI calls (UTC day).
 * Env: LISTING_AI_DAILY_LIMIT (default 20), LISTING_AI_COOLDOWN_SEC (default 45).
 */
export async function assertListingAiAllowed(userId: string): Promise<ListingAiRateLimitResult> {
  const dailyLimit = parsePositiveInt(process.env.LISTING_AI_DAILY_LIMIT, 20);
  const cooldownSec = parsePositiveInt(process.env.LISTING_AI_COOLDOWN_SEC, 45);

  const now = new Date();
  const dayStart = utcDayStart(now);

  const [todayCount, lastRun] = await Promise.all([
    prisma.listingAiRun.count({
      where: { createdById: userId, createdAt: { gte: dayStart } },
    }),
    prisma.listingAiRun.findFirst({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  if (todayCount >= dailyLimit) {
    return {
      ok: false,
      status: 429,
      message: `Daily listing AI limit reached (${dailyLimit} runs per day). Try again tomorrow.`,
    };
  }

  if (lastRun) {
    const elapsedSec = (now.getTime() - lastRun.createdAt.getTime()) / 1000;
    if (elapsedSec < cooldownSec) {
      const wait = Math.ceil(cooldownSec - elapsedSec);
      return {
        ok: false,
        status: 429,
        message: `Please wait ${wait}s before another listing AI generation.`,
      };
    }
  }

  return { ok: true };
}
