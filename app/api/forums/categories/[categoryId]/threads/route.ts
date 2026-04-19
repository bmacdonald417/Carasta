import { NextRequest, NextResponse } from "next/server";

import { listThreadsForCategory } from "@/lib/forums/forum-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/forums/categories/[categoryId]/threads — paginated threads for a category.
 * Query: take (1–50, default 20), page (1-based), sort (trending|new|top).
 * Auth: none (public read).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  const { searchParams } = new URL(request.url);
  const takeRaw = searchParams.get("take");
  const pageRaw = searchParams.get("page");
  const sortRaw = searchParams.get("sort");
  const take = takeRaw ? Number.parseInt(takeRaw, 10) : undefined;
  const page = pageRaw ? Number.parseInt(pageRaw, 10) : undefined;
  const sort =
    sortRaw === "new" || sortRaw === "top" || sortRaw === "trending" ? sortRaw : undefined;

  const result = await listThreadsForCategory({
    categoryId,
    take: Number.isFinite(take) ? take : undefined,
    page: Number.isFinite(page) ? page : undefined,
    sort,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
