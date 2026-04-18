import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";

import { mintCarmunityAccessToken } from "@/lib/auth/carmunity-access-token";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/mobile/token — exchange email/password for a NextAuth-compatible JWT.
 * Send as `Authorization: Bearer <accessToken>` on Carmunity APIs (same as cookie JWT value).
 *
 * **Security:** HTTPS only in production; rate-limit at the edge in real deploys.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const o = body as Record<string, unknown>;
  const email = typeof o.email === "string" ? o.email.trim().toLowerCase() : "";
  const password = typeof o.password === "string" ? o.password : "";
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      name: true,
      avatarUrl: true,
      image: true,
      handle: true,
      role: true,
    },
  });
  if (!user?.passwordHash) {
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  const ok = await compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  let accessToken: string;
  try {
    accessToken = await mintCarmunityAccessToken({
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
      { ok: false, error: "Server cannot mint tokens (NEXTAUTH_SECRET missing)." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    accessToken,
    userId: user.id,
    handle: user.handle,
  });
}
