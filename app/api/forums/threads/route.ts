import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { createForumThread } from "@/lib/forums/forum-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/forums/threads — create a thread (signed in).
 * Body: { "categoryId": string, "title": string, "body": string }
 */
export async function POST(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

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
  const categoryId = typeof o.categoryId === "string" ? o.categoryId : "";
  const title = typeof o.title === "string" ? o.title : "";
  const text = typeof o.body === "string" ? o.body : "";

  const result = await createForumThread({
    authorId: userId,
    categoryId,
    title,
    body: text,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
