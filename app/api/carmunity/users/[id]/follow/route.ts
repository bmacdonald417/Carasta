import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { followCarmunityUser, unfollowCarmunityUser } from "@/lib/carmunity/engagement-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/carmunity/users/[id]/follow — follow user by target user id.
 * DELETE /api/carmunity/users/[id]/follow — unfollow.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getJwtSubjectUserId(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: followingId } = await params;
  const result = await followCarmunityUser({
    followerId: userId,
    followingId,
  });
  if (!result.ok) {
    const status =
      result.error === "User not found." ? 404 : result.error === "Cannot follow yourself." ? 400 : 400;
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
  const { id: followingId } = await params;
  const result = await unfollowCarmunityUser({
    followerId: userId,
    followingId,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
