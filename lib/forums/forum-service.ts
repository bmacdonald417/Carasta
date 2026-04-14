import { prisma } from "@/lib/db";

export type ForumServiceError = { ok: false; error: string };
export type ForumServiceOk<T extends object> = { ok: true } & T;

const authorSelect = {
  id: true,
  handle: true,
  name: true,
  avatarUrl: true,
} as const;

export async function listForumSpaces(): Promise<
  ForumServiceOk<{
    spaces: Array<{
      id: string;
      slug: string;
      title: string;
      description: string | null;
      sortOrder: number;
      categoryCount: number;
    }>;
  }>
> {
  const rows = await prisma.forumSpace.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { categories: true } },
    },
  });
  return {
    ok: true,
    spaces: rows.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description,
      sortOrder: s.sortOrder,
      categoryCount: s._count.categories,
    })),
  };
}

export async function getForumSpaceBySlug(slug: string): Promise<
  ForumServiceOk<{
    space: {
      id: string;
      slug: string;
      title: string;
      description: string | null;
      sortOrder: number;
      categories: Array<{
        id: string;
        slug: string;
        title: string;
        description: string | null;
        sortOrder: number;
        threadCount: number;
        metadata: unknown;
      }>;
    };
  }> | { ok: false; error: string }
> {
  const space = await prisma.forumSpace.findFirst({
    where: { slug, isActive: true },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { threads: true } },
        },
      },
    },
  });
  if (!space) {
    return { ok: false, error: "Forum space not found." };
  }
  return {
    ok: true,
    space: {
      id: space.id,
      slug: space.slug,
      title: space.title,
      description: space.description,
      sortOrder: space.sortOrder,
      categories: space.categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        sortOrder: c.sortOrder,
        threadCount: c._count.threads,
        metadata: c.metadata ?? null,
      })),
    },
  };
}

export async function listThreadsForCategory(input: {
  categoryId: string;
  take?: number;
  cursor?: string;
}): Promise<
  ForumServiceOk<{
    threads: Array<{
      id: string;
      title: string;
      replyCount: number;
      lastActivityAt: string;
      createdAt: string;
      author: { id: string; handle: string; name: string | null; avatarUrl: string | null };
    }>;
    nextCursor: string | null;
  }> | { ok: false; error: string }
> {
  const take = Math.min(Math.max(input.take ?? 20, 1), 50);
  const cat = await prisma.forumCategory.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });
  if (!cat) {
    return { ok: false, error: "Category not found." };
  }

  const threads = await prisma.forumThread.findMany({
    where: { categoryId: input.categoryId },
    take: take + 1,
    ...(input.cursor
      ? {
          skip: 1,
          cursor: { id: input.cursor },
        }
      : {}),
    orderBy: { lastActivityAt: "desc" },
    include: {
      author: { select: authorSelect },
    },
  });

  const hasMore = threads.length > take;
  const slice = hasMore ? threads.slice(0, take) : threads;
  const nextCursor = hasMore ? slice[slice.length - 1]!.id : null;

  return {
    ok: true,
    threads: slice.map((t) => ({
      id: t.id,
      title: t.title,
      replyCount: t.replyCount,
      lastActivityAt: t.lastActivityAt.toISOString(),
      createdAt: t.createdAt.toISOString(),
      author: {
        id: t.author.id,
        handle: t.author.handle,
        name: t.author.name,
        avatarUrl: t.author.avatarUrl,
      },
    })),
    nextCursor,
  };
}

export async function getForumThreadDetail(threadId: string): Promise<
  ForumServiceOk<{
    thread: {
      id: string;
      title: string;
      body: string;
      replyCount: number;
      locked: boolean;
      lastActivityAt: string;
      createdAt: string;
      category: {
        id: string;
        slug: string;
        title: string;
        space: { id: string; slug: string; title: string };
      };
      author: { id: string; handle: string; name: string | null; avatarUrl: string | null };
      replies: Array<{
        id: string;
        body: string;
        createdAt: string;
        author: { id: string; handle: string; name: string | null; avatarUrl: string | null };
      }>;
    };
  }> | null
> {
  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    include: {
      author: { select: authorSelect },
      category: {
        select: {
          id: true,
          slug: true,
          title: true,
          space: { select: { id: true, slug: true, title: true } },
        },
      },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: authorSelect },
        },
      },
    },
  });
  if (!thread) return null;

  return {
    ok: true,
    thread: {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      replyCount: thread.replyCount,
      locked: thread.locked,
      lastActivityAt: thread.lastActivityAt.toISOString(),
      createdAt: thread.createdAt.toISOString(),
      category: {
        id: thread.category.id,
        slug: thread.category.slug,
        title: thread.category.title,
        space: {
          id: thread.category.space.id,
          slug: thread.category.space.slug,
          title: thread.category.space.title,
        },
      },
      author: {
        id: thread.author.id,
        handle: thread.author.handle,
        name: thread.author.name,
        avatarUrl: thread.author.avatarUrl,
      },
      replies: thread.replies.map((r) => ({
        id: r.id,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        author: {
          id: r.author.id,
          handle: r.author.handle,
          name: r.author.name,
          avatarUrl: r.author.avatarUrl,
        },
      })),
    },
  };
}

export async function createForumThread(input: {
  authorId: string;
  categoryId: string;
  title: string;
  body: string;
}): Promise<ForumServiceOk<{ threadId: string }> | ForumServiceError> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!input.categoryId.trim()) {
    return { ok: false, error: "Category is required." };
  }
  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  if (!body) {
    return { ok: false, error: "Body is required." };
  }

  const category = await prisma.forumCategory.findUnique({
    where: { id: input.categoryId },
    include: { space: true },
  });
  if (!category) {
    return { ok: false, error: "Category not found." };
  }
  if (!category.space.isActive) {
    return { ok: false, error: "This forum space is not available." };
  }

  const thread = await prisma.forumThread.create({
    data: {
      categoryId: input.categoryId,
      authorId: input.authorId,
      title,
      body,
      replyCount: 0,
      lastActivityAt: new Date(),
    },
    select: { id: true },
  });
  return { ok: true, threadId: thread.id };
}

export async function createForumReply(input: {
  authorId: string;
  threadId: string;
  body: string;
}): Promise<ForumServiceOk<{ replyId: string; replyCount: number }> | ForumServiceError> {
  const body = input.body.trim();
  if (!body) {
    return { ok: false, error: "Reply cannot be empty." };
  }

  const thread = await prisma.forumThread.findUnique({
    where: { id: input.threadId },
    select: { id: true, locked: true },
  });
  if (!thread) {
    return { ok: false, error: "Thread not found." };
  }
  if (thread.locked) {
    return { ok: false, error: "This thread is locked." };
  }

  const result = await prisma.$transaction(async (tx) => {
    const reply = await tx.forumReply.create({
      data: {
        threadId: input.threadId,
        authorId: input.authorId,
        body,
      },
      select: { id: true },
    });
    const updated = await tx.forumThread.update({
      where: { id: input.threadId },
      data: {
        replyCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
      select: { replyCount: true },
    });
    return { replyId: reply.id, replyCount: updated.replyCount };
  });

  return { ok: true, ...result };
}
