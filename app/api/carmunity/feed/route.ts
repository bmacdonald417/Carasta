import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { getFollowingFeedPayload } from "@/lib/carmunity/following-feed";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "following";
  if (mode !== "following") {
    return NextResponse.json({ message: "Unsupported mode." }, { status: 400 });
  }

  const session = await getSession();
  const viewerId = (session?.user as { id?: string } | undefined)?.id;
  if (!viewerId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const items = await getFollowingFeedPayload(viewerId);
  return NextResponse.json({ items });
}
