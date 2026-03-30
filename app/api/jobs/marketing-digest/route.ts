import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { runMarketingDigestSend } from "@/lib/marketing/run-marketing-digest-send";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getBearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim();
}

function secretConfigured(): boolean {
  const s = process.env.MARKETING_DIGEST_CRON_SECRET?.trim();
  return !!s && s.length >= 16;
}

function secretsMatch(provided: string, expected: string): boolean {
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Hosted weekly digest trigger. Protected by `MARKETING_DIGEST_CRON_SECRET` (Bearer token).
 * Vercel Cron: set the same value in project dashboard “Cron Secret” or pass `Authorization: Bearer ...`.
 *
 * - GET or POST
 * - `?dryRun=1` — no email, no `lastMarketingDigestSentAt` updates; JSON `sent` = would-send count
 * - No-op (200) when `MARKETING_ENABLED` is false or real send is disabled (`MARKETING_DIGEST_SEND_ENABLED` not true) unless `dryRun=1`
 * - Does not honor `MARKETING_DIGEST_FORCE` (spacing always on); use the manual script to force
 */
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!secretConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const expected = process.env.MARKETING_DIGEST_CRON_SECRET!.trim();
  const url = new URL(req.url);
  const qSecret = url.searchParams.get("secret")?.trim();
  const bearer = getBearerToken(req);

  const provided = bearer || qSecret || "";
  if (!secretsMatch(provided, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const dryRun =
    url.searchParams.get("dryRun") === "1" ||
    url.searchParams.get("dry_run") === "1";

  const result = await runMarketingDigestSend({ dryRun, force: false });

  if (!result.ran) {
    return NextResponse.json({
      ok: true,
      noop: result.reason,
      optedInCount: 0,
      sent: 0,
      skippedInterval: 0,
      skippedNoSnapshot: 0,
      errors: [],
    });
  }

  const status = result.errors.length > 0 && result.sent === 0 ? 207 : 200;

  return NextResponse.json(
    {
      ok: result.errors.length === 0 || result.sent > 0 || result.dryRun,
      dryRun: result.dryRun,
      optedInCount: result.optedInCount,
      sent: result.sent,
      skippedInterval: result.skippedInterval,
      skippedNoSnapshot: result.skippedNoSnapshot,
      errors: result.errors,
    },
    { status }
  );
}
