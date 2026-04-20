import { NextRequest, NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Tier = "following" | "participant" | "recent" | "community";

type Row = { handle: string; name: string | null; tier: Tier };

function rankTier(t: Tier) {
  if (t === "following") return 0;
  if (t === "participant" || t === "recent") return 1;
  return 2;
}

/**
 * GET /api/carmunity/mention-suggestions?q=ab&threadId=optional
 * Lightweight handle suggestions for @mention UX (following + thread participants + recent feed/discussion peers + global prefix).
 */
export async function GET(req: NextRequest) {
  const viewerId = await getJwtSubjectUserId(req);
  if (!viewerId) {
    return NextResponse.json({ handles: [] as const });
  }

  const viewer = await prisma.user.findUnique({
    where: { id: viewerId },
    select: { handle: true },
  });
  const selfHandle = viewer?.handle.toLowerCase() ?? "";

  const { searchParams } = new URL(req.url);
  const qRaw = (searchParams.get("q") ?? "").replace(/^@/, "").trim().toLowerCase();
  const q = qRaw.slice(0, 32);
  const hasQuery = q.length >= 1;
  const threadId = searchParams.get("threadId")?.trim() ?? null;

  const out: Row[] = [];
  const seen = new Set<string>();

  const matchesQuery = (handle: string) => {
    if (!hasQuery) return true;
    const h = handle.toLowerCase();
    return h.startsWith(q) || h.includes(q);
  };

  const push = (row: Row) => {
    const h = row.handle.toLowerCase();
    if (seen.has(h)) return;
    if (selfHandle && h === selfHandle) return;
    if (!matchesQuery(row.handle)) return;
    seen.add(h);
    out.push(row);
  };

  const following = await prisma.follow.findMany({
    where: {
      followerId: viewerId,
      ...(hasQuery
        ? {
            following: {
              handle: { contains: q, mode: "insensitive" },
            },
          }
        : {}),
    },
    take: hasQuery ? 10 : 12,
    select: {
      following: { select: { handle: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  for (const f of following) {
    push({
      handle: f.following.handle,
      name: f.following.name,
      tier: "following",
    });
  }

  if (threadId) {
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      select: {
        author: { select: { handle: true, name: true } },
        replies: {
          take: 120,
          orderBy: { createdAt: "desc" },
          select: { author: { select: { handle: true, name: true } } },
        },
      },
    });
    if (thread) {
      push({
        handle: thread.author.handle,
        name: thread.author.name,
        tier: "participant",
      });
      for (const r of thread.replies) {
        push({
          handle: r.author.handle,
          name: r.author.name,
          tier: "participant",
        });
      }
    }
  }

  if (!threadId) {
    const commenters = await prisma.comment.findMany({
      where: { post: { authorId: viewerId }, NOT: { authorId: viewerId } },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { author: { select: { handle: true, name: true } } },
    });
    let recentCount = 0;
    for (const c of commenters) {
      if (recentCount >= 8) break;
      const before = seen.size;
      push({
        handle: c.author.handle,
        name: c.author.name,
        tier: "recent",
      });
      if (seen.size > before) recentCount += 1;
    }

    const threadAuthors = await prisma.forumReply.findMany({
      where: { authorId: viewerId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        thread: { select: { author: { select: { handle: true, name: true } } } },
      },
    });
    for (const row of threadAuthors) {
      if (recentCount >= 8) break;
      const before = seen.size;
      push({
        handle: row.thread.author.handle,
        name: row.thread.author.name,
        tier: "recent",
      });
      if (seen.size > before) recentCount += 1;
    }
  }

  if (hasQuery) {
    const global = await prisma.user.findMany({
      where: {
        handle: { startsWith: q, mode: "insensitive" },
        NOT: { id: viewerId },
      },
      take: 8,
      select: { handle: true, name: true },
      orderBy: { handle: "asc" },
    });
    for (const u of global) {
      push({ handle: u.handle, name: u.name, tier: "community" });
    }
  }

  out.sort((a, b) => {
    const dr = rankTier(a.tier) - rankTier(b.tier);
    if (dr !== 0) return dr;
    return a.handle.localeCompare(b.handle);
  });

  return NextResponse.json({ handles: out.slice(0, 16) });
}
