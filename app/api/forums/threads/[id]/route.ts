import { NextRequest, NextResponse } from "next/server";

import { getForumThreadDetail } from "@/lib/forums/forum-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/forums/threads/[id] — thread detail + replies (oldest reply first).
 * Auth: none (public read).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getForumThreadDetail(id);
  if (!data) {
    return NextResponse.json({ ok: false, error: "Thread not found." }, { status: 404 });
  }
  return NextResponse.json(data);
}
