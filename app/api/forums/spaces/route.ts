import { NextResponse } from "next/server";

import { listForumSpaces } from "@/lib/forums/forum-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/forums/spaces — list active forum spaces (Mechanics Corner, Gear Interests, …).
 * Auth: none (public read).
 */
export async function GET() {
  const result = await listForumSpaces();
  return NextResponse.json(result);
}
