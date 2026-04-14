import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { createForumReply } from "@/lib/forums/forum-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/forums/threads/[id]/replies — add a reply (signed in).
 * Body: { "body": string } or { "content": string } (alias for mobile convenience).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: threadId } = await params;

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
  const raw =
    typeof o.body === "string"
      ? o.body
      : typeof o.content === "string"
        ? o.content
        : "";

  const result = await createForumReply({
    authorId: userId,
    threadId,
    body: raw,
  });
  if (!result.ok) {
    const status =
      result.error === "Thread not found." ? 404 : result.error === "This thread is locked." ? 403 : 400;
    return NextResponse.json(result, { status });
  }
  return NextResponse.json(result);
}
