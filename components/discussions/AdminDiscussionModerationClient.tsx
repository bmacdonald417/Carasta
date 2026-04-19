"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { Button } from "@/components/ui/button";

export type SerializableAdminReportRow = {
  id: string;
  reason: string;
  status: string;
  details: string | null;
  moderatorNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reporterHandle: string;
  reviewedByHandle: string | null;
  thread:
    | null
    | {
        id: string;
        title: string;
        isHidden: boolean;
        spaceSlug: string;
        categorySlug: string;
      };
  reply:
    | null
    | {
        id: string;
        threadId: string;
        isHidden: boolean;
        threadTitle: string;
        threadIsHidden: boolean;
        spaceSlug: string;
        categorySlug: string;
      };
};

const STATUSES = ["OPEN", "REVIEWING", "ACTIONED", "DISMISSED"] as const;

export function AdminDiscussionModerationClient({ rows }: { rows: SerializableAdminReportRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function patchReport(
    id: string,
    body: { status?: string; moderatorNote?: string | null }
  ) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/discussions/reports/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function setThreadHidden(threadId: string, isHidden: boolean) {
    setBusyId(`t:${threadId}`);
    try {
      const res = await fetch(`/api/admin/discussions/threads/${encodeURIComponent(threadId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden }),
      });
      if (!res.ok) return;
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function setReplyHidden(replyId: string, isHidden: boolean) {
    setBusyId(`r:${replyId}`);
    try {
      const res = await fetch(`/api/admin/discussions/replies/${encodeURIComponent(replyId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden }),
      });
      if (!res.ok) return;
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-400">
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Reporter</th>
            <th className="px-4 py-3">Target</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Moderation</th>
            <th className="px-4 py-3 text-right">Open</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-10 text-center text-neutral-500" colSpan={7}>
                No reports yet.
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const href = r.thread
                ? discussionThreadPath(r.thread.spaceSlug, r.thread.categorySlug, r.thread.id)
                : r.reply
                  ? discussionThreadPath(r.reply.spaceSlug, r.reply.categorySlug, r.reply.threadId)
                  : null;
              const label = r.thread
                ? r.thread.title
                : r.reply
                  ? `Reply on: ${r.reply.threadTitle}`
                  : "Unknown";
              const targetBusy = Boolean(
                busyId === r.id ||
                  (r.thread ? busyId === `t:${r.thread.id}` : false) ||
                  (r.reply ? busyId === `r:${r.reply.id}` : false)
              );
              return (
                <tr key={r.id} className="align-top text-neutral-200">
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <Link className="text-primary hover:underline" href={`/u/${r.reporterHandle}`}>
                      @{r.reporterHandle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-300">
                    <p className="line-clamp-2">{label}</p>
                    {r.details ? (
                      <p className="mt-1 line-clamp-2 text-[11px] text-neutral-500">{r.details}</p>
                    ) : null}
                    {r.moderatorNote ? (
                      <p className="mt-1 line-clamp-2 text-[11px] text-neutral-400">
                        <span className="font-semibold text-neutral-300">Note:</span> {r.moderatorNote}
                      </p>
                    ) : null}
                    {r.reviewedAt ? (
                      <p className="mt-1 text-[10px] text-neutral-500">
                        Reviewed{" "}
                        {r.reviewedByHandle ? (
                          <>
                            by @{r.reviewedByHandle} · {new Date(r.reviewedAt).toLocaleString()}
                          </>
                        ) : (
                          new Date(r.reviewedAt).toLocaleString()
                        )}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-neutral-200">{r.reason}</td>
                  <td className="px-4 py-3 text-xs text-neutral-300">
                    <label className="sr-only" htmlFor={`status-${r.id}`}>
                      Status
                    </label>
                    <select
                      id={`status-${r.id}`}
                      className="w-full max-w-[140px] rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-neutral-100"
                      value={r.status}
                      disabled={targetBusy}
                      onChange={(e) => void patchReport(r.id, { status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-300">
                    <div className="flex flex-col gap-2">
                      <textarea
                        className="min-h-[52px] w-full max-w-[220px] rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-neutral-100"
                        placeholder="Moderator note…"
                        defaultValue={r.moderatorNote ?? ""}
                        disabled={targetBusy}
                        onBlur={(e) => {
                          const next = e.target.value.trim();
                          const prev = (r.moderatorNote ?? "").trim();
                          if (next === prev) return;
                          void patchReport(r.id, { moderatorNote: next.length ? next : null });
                        }}
                      />
                      {r.thread ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 border-white/15 text-[10px] font-semibold uppercase tracking-wide"
                          disabled={targetBusy}
                          onClick={() => void setThreadHidden(r.thread!.id, !r.thread!.isHidden)}
                        >
                          {r.thread.isHidden ? "Unhide thread" : "Hide thread"}
                        </Button>
                      ) : null}
                      {r.reply ? (
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 border-white/15 text-[10px] font-semibold uppercase tracking-wide"
                            disabled={targetBusy || r.reply.threadIsHidden}
                            onClick={() => void setReplyHidden(r.reply!.id, !r.reply!.isHidden)}
                          >
                            {r.reply.isHidden ? "Unhide reply" : "Hide reply"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 border-white/15 text-[10px] font-semibold uppercase tracking-wide"
                            disabled={targetBusy}
                            onClick={() => void setThreadHidden(r.reply!.threadId, !r.reply!.threadIsHidden)}
                          >
                            {r.reply.threadIsHidden ? "Unhide thread" : "Hide thread"}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </td>
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
  );
}
