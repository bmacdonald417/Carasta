import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { createCarmunityPost } from "@/lib/carmunity/engagement-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/carmunity/posts — create Carmunity post (JSON). Same rules as web Server Action.
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
  const content = typeof o.content === "string" ? o.content : o.content === null ? null : undefined;
  const imageUrl =
    typeof o.imageUrl === "string" ? o.imageUrl : o.imageUrl === null ? null : undefined;

  const result = await createCarmunityPost({
    authorId: userId,
    content: content ?? undefined,
    imageUrl: imageUrl ?? undefined,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
