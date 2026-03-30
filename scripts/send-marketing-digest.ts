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
 * Hosted weekly run: see `app/api/jobs/marketing-digest/route.ts` and `MARKETING_PHASE_15_NOTES.md`.
 *
 * See MARKETING_PHASE_14_NOTES.md
 */

import { prisma } from "../lib/db";
import { runMarketingDigestSend } from "../lib/marketing/run-marketing-digest-send";

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const sendEnabled = process.env.MARKETING_DIGEST_SEND_ENABLED === "true";

  if (!dryRun && !sendEnabled) {
    console.error(
      "Refusing to send: set MARKETING_DIGEST_SEND_ENABLED=true or use --dry-run."
    );
    process.exit(1);
  }

  const result = await runMarketingDigestSend({
    dryRun,
    force: process.env.MARKETING_DIGEST_FORCE === "1",
    onDryRunPreview: dryRun
      ? (p) => {
          console.log(`--- @${p.handle} <${p.email}> ---`);
          console.log(p.subject);
          console.log(p.textPreview);
        }
      : undefined,
  });

  if (!result.ran) {
    if (result.reason === "marketing_disabled") {
      console.log("MARKETING_ENABLED is off — aborting.");
    } else {
      console.log("MARKETING_DIGEST_SEND_ENABLED is off — use --dry-run for preview.");
    }
    process.exit(0);
  }

  console.log(
    `${result.dryRun ? "[dry-run] " : ""}Opted-in: ${result.optedInCount}, ${result.dryRun ? "would send" : "sent"}: ${result.sent}, skipped (interval): ${result.skippedInterval}, skipped (no snapshot): ${result.skippedNoSnapshot}`
  );

  for (const e of result.errors) {
    console.error(e);
  }
  if (result.errors.length > 0) {
    process.exitCode = 1;
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
