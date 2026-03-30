/**
 * Manual weekly marketing digest for opted-in sellers.
 *
 * ## Dry-run (no email, no DB updates)
 *   npm run marketing:send-digest -- --dry-run
 *
 * ## Send (requires Resend + explicit flag)
 *   RESEND_API_KEY=... MARKETING_DIGEST_FROM="Carasta <digest@domain.com>" MARKETING_DIGEST_SEND_ENABLED=true npm run marketing:send-digest
 *
 * ## Duplicate guard
 * Skips users who received a digest within the last ~6.5 days unless MARKETING_DIGEST_FORCE=1.
 *
 * Requires: MARKETING_ENABLED in env for the app flag check (same as runtime).
 *
 * See MARKETING_PHASE_14_NOTES.md
 */

import { prisma } from "../lib/db";
import { isMarketingEnabled } from "../lib/marketing/feature-flag";
import { buildMarketingDigestSnapshot } from "../lib/marketing/generate-marketing-digest";
import { renderMarketingDigestEmail } from "../lib/marketing/render-marketing-digest-email";
import { sendMarketingDigestEmail } from "../lib/email/send-marketing-digest-email";

const MIN_INTERVAL_MS = 6.5 * 24 * 60 * 60 * 1000;

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const sendEnabled = process.env.MARKETING_DIGEST_SEND_ENABLED === "true";
  const force = process.env.MARKETING_DIGEST_FORCE === "1";

  if (!isMarketingEnabled()) {
    console.log("MARKETING_ENABLED is off — aborting.");
    process.exit(0);
  }

  if (!dryRun && !sendEnabled) {
    console.error(
      "Refusing to send: set MARKETING_DIGEST_SEND_ENABLED=true or use --dry-run."
    );
    process.exit(1);
  }

  const users = await prisma.user.findMany({
    where: { weeklyMarketingDigestOptIn: true },
    select: {
      id: true,
      email: true,
      handle: true,
      lastMarketingDigestSentAt: true,
    },
  });

  console.log(
    `${dryRun ? "[dry-run] " : ""}Found ${users.length} opted-in seller(s).`
  );

  const now = Date.now();
  let sent = 0;
  let skipped = 0;

  for (const u of users) {
    if (
      !force &&
      u.lastMarketingDigestSentAt &&
      now - u.lastMarketingDigestSentAt.getTime() < MIN_INTERVAL_MS
    ) {
      skipped++;
      console.log(`Skip @${u.handle} — sent recently.`);
      continue;
    }

    const snap = await buildMarketingDigestSnapshot(u.id);
    if (!snap) {
      skipped++;
      continue;
    }

    const { subject, html, text } = renderMarketingDigestEmail(snap);

    if (dryRun) {
      console.log(`--- @${u.handle} <${u.email}> ---`);
      console.log(subject);
      console.log(text.slice(0, 500) + (text.length > 500 ? "…" : ""));
      continue;
    }

    const result = await sendMarketingDigestEmail({
      to: u.email,
      subject,
      html,
      text,
    });

    if (!result.ok) {
      console.error(`@${u.handle}: ${result.error}`);
      if (!result.skipped) process.exitCode = 1;
      continue;
    }

    await prisma.user.update({
      where: { id: u.id },
      data: { lastMarketingDigestSentAt: new Date() },
    });
    sent++;
    console.log(`Sent to @${u.handle} (${u.email})`);
  }

  if (!dryRun) {
    console.log(`Done. Sent: ${sent}, skipped (interval): ${skipped}.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
