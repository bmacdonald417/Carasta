import { prisma } from "@/lib/db";

export type CopilotRateLimitResult =
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
 * Per-user daily cap + cooldown between copilot OpenAI calls (UTC day).
 * Env: MARKETING_COPILOT_DAILY_LIMIT (default 25), MARKETING_COPILOT_COOLDOWN_SEC (default 45).
 */
export async function assertCopilotOpenAiAllowed(userId: string): Promise<CopilotRateLimitResult> {
  const dailyLimit = parsePositiveInt(process.env.MARKETING_COPILOT_DAILY_LIMIT, 25);
  const cooldownSec = parsePositiveInt(process.env.MARKETING_COPILOT_COOLDOWN_SEC, 45);

  const now = new Date();
  const dayStart = utcDayStart(now);

  const [todayCount, lastRun] = await Promise.all([
    prisma.marketingCopilotRun.count({
      where: { createdById: userId, createdAt: { gte: dayStart } },
    }),
    prisma.marketingCopilotRun.findFirst({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  if (todayCount >= dailyLimit) {
    return {
      ok: false,
      status: 429,
      message: `Daily copilot limit reached (${dailyLimit} runs per day). Try again tomorrow.`,
    };
  }

  if (lastRun) {
    const elapsedSec = (now.getTime() - lastRun.createdAt.getTime()) / 1000;
    if (elapsedSec < cooldownSec) {
      const wait = Math.ceil(cooldownSec - elapsedSec);
      return {
        ok: false,
        status: 429,
        message: `Please wait ${wait}s before another copilot generation.`,
      };
    }
  }

  return { ok: true };
}
