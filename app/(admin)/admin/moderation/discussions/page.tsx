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
    <div className="carasta-container max-w-6xl py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">Admin</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
            Discussion moderation
          </h1>
          <p className="mt-2 max-w-prose text-sm text-neutral-400">
            Review reports, update status, leave internal notes, and soft-hide threads or replies. Hidden
            content stays in the database; regular members no longer see it in lists or on thread pages.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-primary hover:underline">
          ← Admin home
        </Link>
      </div>

      <AdminDiscussionModerationClient rows={serializable} />
    </div>
  );
}
