import { NextRequest, NextResponse } from "next/server";

import { mintCarmunityAccessToken } from "@/lib/auth/carmunity-access-token";
import { assertCarmunityDemoApisEnabled, isDemoSeedEmail } from "@/lib/carmunity/demo-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "next-auth.session-token";

/**
 * POST /api/carmunity/demo-session — development only.
 * Body: { "email": "tom@example.com" }
 * Returns a NextAuth session JWT value the app can send as Cookie (same as browser).
 */
export async function POST(req: NextRequest) {
  const denied = assertCarmunityDemoApisEnabled();
  if (denied) return denied;

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

  let token: string;
  try {
    token = await mintCarmunityAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      image: user.image,
      handle: user.handle,
      role: user.role,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "NEXTAUTH_SECRET is not set; cannot mint a session token." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    userId: user.id,
    sessionToken: token,
    cookieName: COOKIE_NAME,
    handle: user.handle,
    name: user.name,
  });
}
