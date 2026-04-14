import { NextRequest, NextResponse } from "next/server";

import { listThreadsForCategory } from "@/lib/forums/forum-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/forums/categories/[categoryId]/threads — paginated threads for a category.
 * Query: take (1–50, default 20), cursor (thread id for next page).
 * Auth: none (public read).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  const { searchParams } = new URL(request.url);
  const takeRaw = searchParams.get("take");
  const cursor = searchParams.get("cursor") ?? undefined;
  const take = takeRaw ? Number.parseInt(takeRaw, 10) : undefined;

  const result = await listThreadsForCategory({
    categoryId,
    take: Number.isFinite(take) ? take : undefined,
    cursor,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
