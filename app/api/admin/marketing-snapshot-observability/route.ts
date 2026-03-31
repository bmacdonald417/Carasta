import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getToken } from "next-auth/jwt";
import { getAdminMarketingSnapshotObservabilitySnapshot } from "@/lib/marketing/admin-marketing-snapshot-observability";

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
 * Admin JSON readout for **`GET /api/admin/marketing/snapshot`** in-memory counters (Phase 31).
 *
 * **Auth (either):** signed-in **ADMIN** (NextAuth JWT), or
 * **`Authorization: Bearer <MARKETING_TRACK_OBSERVABILITY_SECRET>`** when set (min 16 chars)
 * — same pattern as **`GET /api/admin/marketing-track-observability`**.
 *
 * Unauthorized: **401** `{ "ok": false }`.
 *
 * @see `MARKETING_PHASE_31_NOTES.md`
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

  const counters = getAdminMarketingSnapshotObservabilitySnapshot();
  let totalObserved = 0;
  for (const n of Object.values(counters)) {
    totalObserved += n;
  }

  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    counters,
    totals: { observedRequests: totalObserved },
    note: "In-memory per Node.js process only; not aggregated across serverless instances.",
  });
}
