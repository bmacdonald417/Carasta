import Link from "next/link";

import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { listDiscussionReportsForAdmin } from "@/lib/forums/discussion-reports";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDiscussionModerationPage() {
  const { rows } = await listDiscussionReportsForAdmin({ prisma, take: 75 });

  return (
    <div className="carasta-container max-w-5xl py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">Admin</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
            Discussion reports
          </h1>
          <p className="mt-2 max-w-prose text-sm text-neutral-400">
            Read-only queue for Carmunity Discussions. This is a governance signal — not automated
            enforcement.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-primary hover:underline"
        >
          ← Admin home
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-400">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-neutral-500" colSpan={6}>
                  No reports yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const href = r.thread
                  ? discussionThreadPath(
                      r.thread.category.space.slug,
                      r.thread.category.slug,
                      r.thread.id
                    )
                  : r.reply
                    ? discussionThreadPath(
                        r.reply.thread.category.space.slug,
                        r.reply.thread.category.slug,
                        r.reply.thread.id
                      )
                    : null;
                const label = r.thread
                  ? r.thread.title
                  : r.reply
                    ? `Reply on: ${r.reply.thread.title}`
                    : "Unknown";
                return (
                  <tr key={r.id} className="align-top text-neutral-200">
                    <td className="px-4 py-3 text-xs text-neutral-400">
                      {r.createdAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <Link className="text-primary hover:underline" href={`/u/${r.reporter.handle}`}>
                        @{r.reporter.handle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-300">
                      <p className="line-clamp-2">{label}</p>
                      {r.details ? (
                        <p className="mt-1 line-clamp-2 text-[11px] text-neutral-500">{r.details}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-neutral-200">{r.reason}</td>
                    <td className="px-4 py-3 text-xs text-neutral-400">{r.status}</td>
                    <td className="px-4 py-3 text-right text-xs">
                      {href ? (
                        <Link className="text-primary hover:underline" href={href}>
                          View thread
                        </Link>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
