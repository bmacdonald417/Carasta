import type {
  DiscussionReportReason,
  DiscussionReportStatus,
  PrismaClient,
} from "@prisma/client";

export type CreateDiscussionReportInput = {
  prisma: PrismaClient;
  reporterId: string;
  target: "thread" | "reply";
  threadId: string;
  replyId?: string | null;
  reason: DiscussionReportReason;
  details?: string | null;
};

export type CreateDiscussionReportResult =
  | { ok: true; reportId: string; deduped: boolean }
  | { ok: false; error: string };

function normalizeDetails(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t) return null;
  return t.slice(0, 4000);
}

export async function createDiscussionReport(
  input: CreateDiscussionReportInput
): Promise<CreateDiscussionReportResult> {
  const details = normalizeDetails(input.details);

  if (input.target === "thread") {
    const thread = await input.prisma.forumThread.findUnique({
      where: { id: input.threadId },
      select: { id: true, authorId: true },
    });
    if (!thread) return { ok: false, error: "Thread not found." };
    if (thread.authorId === input.reporterId) {
      return { ok: false, error: "You can’t report your own thread." };
    }

    const dup = await input.prisma.discussionReport.findFirst({
      where: {
        reporterId: input.reporterId,
        status: "OPEN",
        reason: input.reason,
        threadId: thread.id,
        replyId: null,
      },
      select: { id: true },
    });
    if (dup) {
      return { ok: true, reportId: dup.id, deduped: true };
    }

    const row = await input.prisma.discussionReport.create({
      data: {
        reporterId: input.reporterId,
        threadId: thread.id,
        replyId: null,
        reason: input.reason,
        details,
        status: "OPEN",
      },
      select: { id: true },
    });
    return { ok: true, reportId: row.id, deduped: false };
  }

  if (!input.replyId) {
    return { ok: false, error: "Reply id required." };
  }

  const reply = await input.prisma.forumReply.findFirst({
    where: { id: input.replyId, threadId: input.threadId },
    select: { id: true, authorId: true },
  });
  if (!reply) return { ok: false, error: "Reply not found in this thread." };
  if (reply.authorId === input.reporterId) {
    return { ok: false, error: "You can’t report your own reply." };
  }

  const dup = await input.prisma.discussionReport.findFirst({
    where: {
      reporterId: input.reporterId,
      status: "OPEN",
      reason: input.reason,
      replyId: reply.id,
    },
    select: { id: true },
  });
  if (dup) {
    return { ok: true, reportId: dup.id, deduped: true };
  }

  const row = await input.prisma.discussionReport.create({
    data: {
      reporterId: input.reporterId,
      threadId: null,
      replyId: reply.id,
      reason: input.reason,
      details,
      status: "OPEN",
    },
    select: { id: true },
  });
  return { ok: true, reportId: row.id, deduped: false };
}

export async function listDiscussionReportsForAdmin(input: {
  prisma: PrismaClient;
  status?: DiscussionReportStatus;
  take?: number;
  skip?: number;
}) {
  const take = Math.min(Math.max(input.take ?? 50, 1), 100);
  const skip = Math.max(input.skip ?? 0, 0);
  const where = input.status ? { status: input.status } : {};

  const [rows, total] = await Promise.all([
    input.prisma.discussionReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        reason: true,
        status: true,
        details: true,
        createdAt: true,
        reporter: { select: { handle: true } },
        thread: {
          select: {
            id: true,
            title: true,
            category: {
              select: { slug: true, space: { select: { slug: true } } },
            },
          },
        },
        reply: {
          select: {
            id: true,
            threadId: true,
            body: true,
            thread: {
              select: {
                id: true,
                title: true,
                category: {
                  select: { slug: true, space: { select: { slug: true } } },
                },
              },
            },
          },
        },
      },
    }),
    input.prisma.discussionReport.count({ where }),
  ]);

  return { rows, total, take, skip };
}
