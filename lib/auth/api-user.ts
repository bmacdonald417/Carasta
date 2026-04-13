import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Resolves the signed-in user id from the NextAuth JWT attached to the request.
 * Works when the client sends the session cookie (browser). For mobile, the same
 * JWT must be sent (e.g. Cookie header) until a Bearer strategy is added.
 */
export async function getJwtSubjectUserId(req: NextRequest): Promise<string | undefined> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return undefined;
  const token = await getToken({ req, secret });
  const sub = token?.sub;
  return typeof sub === "string" && sub.length > 0 ? sub : undefined;
}
