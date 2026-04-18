import type { Role } from "@prisma/client";
import { encode } from "next-auth/jwt";

const MAX_AGE_SEC = 30 * 24 * 60 * 60;

export type CarmunityAccessUserPayload = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  image: string | null;
  handle: string;
  role: Role;
};

/**
 * Mints a NextAuth-compatible JWT (same secret / maxAge as `authOptions.session`).
 * Use for dev demo-session and mobile credential exchange — not bidding logic.
 */
export async function mintCarmunityAccessToken(user: CarmunityAccessUserPayload): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret?.trim()) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }
  const picture = user.avatarUrl ?? user.image ?? null;
  return encode({
    secret,
    maxAge: MAX_AGE_SEC,
    token: {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      picture,
      handle: user.handle,
      role: user.role,
    },
  });
}
