import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

import { assertCarmunityDemoApisEnabled, isDemoSeedEmail } from "@/lib/carmunity/demo-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "next-auth.session-token";
const MAX_AGE_SEC = 30 * 24 * 60 * 60;

/**
 * POST /api/carmunity/demo-session — development only.
 * Body: { "email": "tom@example.com" }
 * Returns a NextAuth session JWT value the app can send as Cookie (same as browser).
 */
export async function POST(req: NextRequest) {
  const denied = assertCarmunityDemoApisEnabled();
  if (denied) return denied;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret?.trim()) {
    return NextResponse.json(
      { ok: false, error: "NEXTAUTH_SECRET is not set; cannot mint a session token." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const emailRaw = (body as Record<string, unknown>).email;
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
  if (!email || !isDemoSeedEmail(email)) {
    return NextResponse.json({ ok: false, error: "Unknown demo account." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      image: true,
      handle: true,
      role: true,
    },
  });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found. Run prisma db seed against this database." },
      { status: 404 }
    );
  }

  const picture = user.avatarUrl ?? user.image ?? null;
  const token = await encode({
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

  return NextResponse.json({
    ok: true,
    userId: user.id,
    sessionToken: token,
    cookieName: COOKIE_NAME,
    handle: user.handle,
    name: user.name,
  });
}
