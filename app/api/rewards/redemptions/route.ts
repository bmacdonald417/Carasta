import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/rewards/redemptions
 * Public list of active redemption options (safe to show to signed-out users).
 */
export async function GET(_req: NextRequest) {
  const options = await prisma.redemptionOption.findMany({
    where: { isActive: true },
    orderBy: { cost: "asc" },
    select: { code: true, type: true, title: true, description: true, cost: true },
    take: 100,
  });
  return NextResponse.json({ ok: true, options });
}

