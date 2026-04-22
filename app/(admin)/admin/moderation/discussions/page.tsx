import Link from "next/link";

import { AdminDiscussionModerationClient } from "@/components/discussions/AdminDiscussionModerationClient";
import type { SerializableAdminReportRow } from "@/components/discussions/AdminDiscussionModerationClient";
import { listDiscussionReportsForAdmin } from "@/lib/forums/discussion-reports";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDiscussionModerationPage() {
  const { rows } = await listDiscussionReportsForAdmin({ prisma, take: 75 });

  const serializable: SerializableAdminReportRow[] = rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    status: r.status,
    details: r.details,
    moderatorNote: r.moderatorNote,
    createdAt: r.createdAt.toISOString(),
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
    reporterHandle: r.reporter.handle,
    reviewedByHandle: r.reviewedBy?.handle ?? null,
    thread: r.thread
      ? {
          id: r.thread.id,
          title: r.thread.title,
          isHidden: r.thread.isHidden,
          spaceSlug: r.thread.category.space.slug,
          categorySlug: r.thread.category.slug,
        }
      : null,
    reply: r.reply
      ? {
          id: r.reply.id,
          threadId: r.reply.thread.id,
          isHidden: r.reply.isHidden,
          threadTitle: r.reply.thread.title,
          threadIsHidden: r.reply.thread.isHidden,
          spaceSlug: r.reply.thread.category.space.slug,
          categorySlug: r.reply.thread.category.slug,
        }
      : null,
  }));

  return (
    <div className="carasta-container max-w-6xl py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Discussion moderation
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Review reports, update status, leave internal notes, and soft-hide threads or replies. Hidden
            content stays in the database; regular members no longer see it in lists or on thread pages.
          </p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          ← Admin home
        </Link>
      </div>

      <AdminDiscussionModerationClient rows={serializable} />
    </div>
  );
}
