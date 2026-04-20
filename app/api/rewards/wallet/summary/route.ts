import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { getWalletSummary } from "@/lib/rewards/ledger/wallet";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const summary = await getWalletSummary(userId);
  return NextResponse.json({ ok: true, summary });
}

