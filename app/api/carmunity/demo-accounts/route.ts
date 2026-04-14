import { NextResponse } from "next/server";

import { assertCarmunityDemoApisEnabled, DEMO_SEED_EMAILS } from "@/lib/carmunity/demo-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/carmunity/demo-accounts — development only.
 * Lists seeded demo users with post + listing counts for mobile demo sign-in.
 */
export async function GET() {
  const denied = assertCarmunityDemoApisEnabled();
  if (denied) return denied;

  const users = await prisma.user.findMany({
    where: { email: { in: [...DEMO_SEED_EMAILS] } },
    select: {
      id: true,
      email: true,
      handle: true,
      name: true,
      _count: {
        select: {
          posts: true,
          auctions: true,
        },
      },
    },
    orderBy: { email: "asc" },
  });

  const accounts = users.map((u) => ({
    id: u.id,
    email: u.email,
    handle: u.handle,
    name: u.name,
    postsCount: u._count.posts,
    listingsCount: u._count.auctions,
    label: u.name != null && u.name.length > 0 ? `${u.name} · @${u.handle}` : `@${u.handle}`,
    subtitle:
      u._count.posts > 0 && u._count.auctions > 0
        ? `${u._count.posts} posts · ${u._count.auctions} listings`
        : u._count.posts > 0
          ? `${u._count.posts} posts`
          : `${u._count.auctions} listings`,
  }));

  return NextResponse.json({ ok: true, accounts });
}
