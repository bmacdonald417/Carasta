import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { addCarmunityComment } from "@/lib/carmunity/engagement-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/carmunity/posts/[id]/comments — add comment (JSON body `{ "content": "..." }`).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: postId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const content = (body as Record<string, unknown>).content;
  if (typeof content !== "string") {
    return NextResponse.json({ ok: false, error: "content is required" }, { status: 400 });
  }

  const result = await addCarmunityComment({
    authorId: userId,
    postId,
    content,
  });
  if (!result.ok) {
    const status = result.error === "Post not found." ? 404 : 400;
    return NextResponse.json(result, { status });
  }
  return NextResponse.json(result);
}
