import type { NextRequest } from "next/server";
import { decode, getToken } from "next-auth/jwt";
import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";

function subjectFromPayload(payload: Record<string, unknown> | null): string | undefined {
  if (!payload) return undefined;
  const sub = payload.sub;
  if (typeof sub === "string" && sub.length > 0) return sub;
  const id = payload.id;
  if (typeof id === "string" && id.length > 0) return id;
  return undefined;
}

/**
 * Resolves the signed-in user id from the NextAuth JWT.
 * - **Cookie:** same as browser (`getToken`).
 * - **Bearer:** `Authorization: Bearer <jwt>` where `<jwt>` matches the encoded session token
 *   (from `mintCarmunityAccessToken`, web cookie value, or `POST /api/auth/mobile/token`).
 */
export async function getJwtSubjectUserId(req: NextRequest): Promise<string | undefined> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (isReviewModeEnabled()) {
      const ctx = await getReviewModeContext();
      return ctx?.sellerUserId;
    }
    return undefined;
  }

  const fromCookie = await getToken({ req, secret });
  const cookieSub = subjectFromPayload(fromCookie as Record<string, unknown> | null);
  if (cookieSub) return cookieSub;

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const raw = auth.slice(7).trim();
    if (!raw) return undefined;
    const decoded = (await decode({ token: raw, secret })) as Record<string, unknown> | null;
    return subjectFromPayload(decoded);
  }

  if (isReviewModeEnabled()) {
    const ctx = await getReviewModeContext();
    return ctx?.sellerUserId;
  }

  return undefined;
}
