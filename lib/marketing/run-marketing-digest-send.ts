import { prisma } from "@/lib/db";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { buildMarketingDigestSnapshot } from "@/lib/marketing/generate-marketing-digest";
import { renderMarketingDigestEmail } from "@/lib/marketing/render-marketing-digest-email";
import { sendMarketingDigestEmail } from "@/lib/email/send-marketing-digest-email";

const MIN_INTERVAL_MS = 6.5 * 24 * 60 * 60 * 1000;

export type MarketingDigestRunResult =
  | {
      ran: false;
      reason: "marketing_disabled" | "send_disabled";
      optedInCount: number;
      sent: number;
      skippedInterval: number;
      skippedNoSnapshot: number;
      errors: string[];
    }
  | {
      ran: true;
      dryRun: boolean;
      optedInCount: number;
      sent: number;
      skippedInterval: number;
      skippedNoSnapshot: number;
      errors: string[];
    };

export type MarketingDigestDryRunPreview = {
  handle: string;
  email: string;
  subject: string;
  textPreview: string;
};

/**
 * Shared digest batch: opted-in sellers, interval dedupe, Resend send.
 * Used by `scripts/send-marketing-digest.ts` and `app/api/jobs/marketing-digest/route.ts`.
 *
 * Real sends require `MARKETING_DIGEST_SEND_ENABLED=true` unless `dryRun: true`.
 *
 * **`force`** skips the ~6.5-day spacing guard (CLI may set from `MARKETING_DIGEST_FORCE=1`;
 * the hosted cron handler passes `force: false` only).
 */
export async function runMarketingDigestSend(params: {
  dryRun: boolean;
  force?: boolean;
  /** When `dryRun`, optional logging for the CLI script. */
  onDryRunPreview?: (p: MarketingDigestDryRunPreview) => void;
}): Promise<MarketingDigestRunResult> {
  const emptyOk = (
    reason: "marketing_disabled" | "send_disabled"
  ): MarketingDigestRunResult => ({
    ran: false,
    reason,
    optedInCount: 0,
    sent: 0,
    skippedInterval: 0,
    skippedNoSnapshot: 0,
    errors: [],
  });

  if (!isMarketingEnabled()) {
    return emptyOk("marketing_disabled");
  }

  const sendEnabled = process.env.MARKETING_DIGEST_SEND_ENABLED === "true";
  if (!params.dryRun && !sendEnabled) {
    return emptyOk("send_disabled");
  }

  const force = params.force === true;

  const users = await prisma.user.findMany({
    where: { weeklyMarketingDigestOptIn: true },
    select: {
      id: true,
      email: true,
      handle: true,
      lastMarketingDigestSentAt: true,
    },
  });

  const now = Date.now();
  let sent = 0;
  let skippedInterval = 0;
  let skippedNoSnapshot = 0;
  const errors: string[] = [];

  for (const u of users) {
    if (
      !force &&
      u.lastMarketingDigestSentAt &&
      now - u.lastMarketingDigestSentAt.getTime() < MIN_INTERVAL_MS
    ) {
      skippedInterval++;
      continue;
    }

    const snap = await buildMarketingDigestSnapshot(u.id);
    if (!snap) {
      skippedNoSnapshot++;
      continue;
    }

    const { subject, html, text } = renderMarketingDigestEmail(snap);

    if (params.dryRun) {
      params.onDryRunPreview?.({
        handle: u.handle,
        email: u.email,
        subject,
        textPreview: text.slice(0, 500) + (text.length > 500 ? "…" : ""),
      });
      sent++;
      continue;
    }

    const result = await sendMarketingDigestEmail({
      to: u.email,
      subject,
      html,
      text,
    });

    if (!result.ok) {
      errors.push(`${u.handle}: ${result.error}`);
      continue;
    }

    await prisma.user.update({
      where: { id: u.id },
      data: { lastMarketingDigestSentAt: new Date() },
    });
    sent++;
  }

  return {
    ran: true,
    dryRun: params.dryRun,
    optedInCount: users.length,
    sent,
    skippedInterval,
    skippedNoSnapshot,
    errors,
  };
}
