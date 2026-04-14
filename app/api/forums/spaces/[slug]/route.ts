import { NextRequest, NextResponse } from "next/server";

import { getForumSpaceBySlug } from "@/lib/forums/forum-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/forums/spaces/[slug] — space detail + categories with thread counts.
 * Auth: none (public read).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await getForumSpaceBySlug(slug);
  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
