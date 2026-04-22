"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { Button } from "@/components/ui/button";
import { isReviewModeClient } from "@/components/review-mode/review-mode-client";

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
  const reviewMode = isReviewModeClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function patchReport(
    id: string,
    body: { status?: string; moderatorNote?: string | null }
  ) {
    if (reviewMode) return;
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
    if (reviewMode) return;
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
    if (reviewMode) return;
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
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-e1">
      {reviewMode ? (
        <div className="border-b border-caution/25 bg-caution-soft px-4 py-3 text-xs text-caution-foreground">
          Review mode: moderation actions are disabled. This surface is available for visual and
          workflow review only.
        </div>
      ) : null}
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Reporter</th>
            <th className="px-4 py-3">Target</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Moderation</th>
            <th className="px-4 py-3 text-right">Open</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-10 text-center text-muted-foreground" colSpan={7}>
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
                <tr key={r.id} className="align-top text-foreground transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <Link
                      className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      href={`/u/${r.reporterHandle}`}
                    >
                      @{r.reporterHandle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">
                    <p className="line-clamp-2">{label}</p>
                    {r.details ? (
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{r.details}</p>
                    ) : null}
                    {r.moderatorNote ? (
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Note:</span> {r.moderatorNote}
                      </p>
                    ) : null}
                    {r.reviewedAt ? (
                      <p className="mt-1 text-[10px] text-muted-foreground">
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
                  <td className="px-4 py-3 text-xs font-semibold text-foreground">{r.reason}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <label className="sr-only" htmlFor={`status-${r.id}`}>
                      Status
                    </label>
                    <select
                      id={`status-${r.id}`}
                      className="w-full max-w-[140px] rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground shadow-sm"
                      value={r.status}
                      disabled={targetBusy || reviewMode}
                      onChange={(e) => void patchReport(r.id, { status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div className="flex flex-col gap-2">
                      <textarea
                        className="min-h-[52px] w-full max-w-[220px] rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground shadow-sm"
                        placeholder="Moderator note…"
                        defaultValue={r.moderatorNote ?? ""}
                        disabled={targetBusy || reviewMode}
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
                          className="h-7 text-[10px] font-medium"
                          disabled={targetBusy || reviewMode}
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
                            className="h-7 text-[10px] font-medium"
                            disabled={targetBusy || reviewMode || r.reply.threadIsHidden}
                            onClick={() => void setReplyHidden(r.reply!.id, !r.reply!.isHidden)}
                          >
                            {r.reply.isHidden ? "Unhide reply" : "Hide reply"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] font-medium"
                            disabled={targetBusy || reviewMode}
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
                      <Link
                        className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        href={href}
                      >
                        View thread
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
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
