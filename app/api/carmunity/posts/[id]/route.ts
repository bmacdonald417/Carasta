import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { getCarmunityPostDetailJson } from "@/lib/carmunity/post-read-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/carmunity/posts/[id] — post detail + comments + viewer flags (JSON).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const viewerUserId = await getJwtSubjectUserId(request);
  const data = await getCarmunityPostDetailJson(postId, viewerUserId);
  if (!data) {
    return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, post: data });
}
