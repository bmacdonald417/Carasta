import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getToken } from "next-auth/jwt";
import { getMarketingTrackObservabilityReport } from "@/lib/marketing/marketing-track-observability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getBearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim();
}

function observabilitySecretConfigured(): boolean {
  const s = process.env.MARKETING_TRACK_OBSERVABILITY_SECRET?.trim();
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
 * Admin / ops JSON snapshot for marketing track counters (Phase 18).
 *
 * **Auth (either):**
 * - Signed-in **ADMIN** (NextAuth JWT cookie on the request), or
 * - **`Authorization: Bearer <MARKETING_TRACK_OBSERVABILITY_SECRET>`** when that env var is set (min 16 chars).
 *
 * Unauthorized: **401** `{ "ok": false }` (generic).
 *
 * @see `MARKETING_PHASE_18_NOTES.md`
 */
export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAdmin = token?.role === "ADMIN";

  let authorized = isAdmin;
  if (!authorized && observabilitySecretConfigured()) {
    const expected = process.env.MARKETING_TRACK_OBSERVABILITY_SECRET!.trim();
    const bearer = getBearerToken(req);
    if (bearer && secretsMatch(bearer, expected)) {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const report = getMarketingTrackObservabilityReport();
  return NextResponse.json({ ok: true, ...report });
}
