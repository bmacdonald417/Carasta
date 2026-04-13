import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { likeCarmunityPost, unlikeCarmunityPost } from "@/lib/carmunity/engagement-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/carmunity/posts/[id]/like — like post.
 * DELETE /api/carmunity/posts/[id]/like — remove like.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getJwtSubjectUserId(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: postId } = await params;
  const result = await likeCarmunityPost({ userId, postId });
  if (!result.ok) {
    const status = result.error === "Post not found." ? 404 : 400;
    return NextResponse.json(result, { status });
  }
  return NextResponse.json(result);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getJwtSubjectUserId(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: postId } = await params;
  const result = await unlikeCarmunityPost({ userId, postId });
  if (!result.ok) {
    const status = result.error === "Post not found." ? 404 : 400;
    return NextResponse.json(result, { status });
  }
  return NextResponse.json(result);
}
