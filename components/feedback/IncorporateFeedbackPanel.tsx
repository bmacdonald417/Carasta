"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AgentRunEventDto } from "./types";
import { CheckCircle2, Loader2, Play, Terminal, XCircle } from "lucide-react";

type RunStatus = "running" | "done" | "error" | null;

type Props = {
  className?: string;
};

/**
 * Starts a server-side agent run and polls events with backoff on errors.
 * Stops polling once the run reaches done/error status.
 */
export default function IncorporateFeedbackPanel({ className }: Props) {
  const [runId, setRunId] = useState<string | null>(null);
  const [events, setEvents] = useState<AgentRunEventDto[]>([]);
  const [runStatus, setRunStatus] = useState<RunStatus>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempt = useRef(0);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const poll = useCallback(async (id: string) => {
    try {
      const [evRes, runRes] = await Promise.all([
        fetch(`/api/agent/run/${id}/events`, { credentials: "include" }),
        fetch(`/api/agent/run/${id}`, { credentials: "include" }),
      ]);
      if (!evRes.ok) throw new Error(`Poll failed (${evRes.status})`);
      const evData = (await evRes.json()) as { events: AgentRunEventDto[] };
      setEvents(evData.events ?? []);
      if (runRes.ok) {
        const runData = (await runRes.json()) as { status: string };
        const s = runData.status as RunStatus;
        setRunStatus(s);
        if (s === "done" || s === "error") {
          clearTimer();
          return;
        }
      }
      setError(null);
      attempt.current = 0;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Poll error";
      setError(msg);
      attempt.current += 1;
    } finally {
      if (timer.current !== null) return;
      const backoff = Math.min(30_000, 800 * 2 ** attempt.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        void poll(id);
      }, backoff);
    }
  }, []);

  useEffect(() => {
    if (!runId) return;
    void poll(runId);
    return () => {
      clearTimer();
    };
  }, [runId, poll]);

  async function start() {
    setBusy(true);
    setError(null);
    setEvents([]);
    setRunStatus(null);
    try {
      const res = await fetch("/api/ai/incorporate-feedback", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string };
        throw new Error(j?.error ?? `Start failed (${res.status})`);
      }
      const data = (await res.json()) as { runId: string };
      setRunId(data.runId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start agent.");
    } finally {
      setBusy(false);
    }
  }

  const isRunning = runId != null && runStatus !== "done" && runStatus !== "error";

  return (
    <section
      className={`rounded-2xl border border-border bg-card p-5 shadow-e1 ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-wide text-foreground">
            Incorporate feedback
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Creates an agent run and event log. Wire your Claude Code routine or
            local script to the shim endpoints.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-2xl"
          onClick={() => void start()}
          disabled={busy || isRunning}
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isRunning ? "Running…" : "Start agent run"}
        </Button>
      </div>

      {runId ? (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Run <span className="font-mono text-foreground">{runId}</span>
            </p>
            {runStatus === "done" && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Done
              </span>
            )}
            {runStatus === "error" && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-400">
                <XCircle className="h-3.5 w-3.5" /> Error
              </span>
            )}
            {isRunning && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Polling…
              </span>
            )}
          </div>
          <div className="max-h-56 overflow-y-auto rounded-2xl border border-border bg-muted/50 p-3 font-mono text-[11px] leading-relaxed text-foreground">
            {events.length === 0 ? (
              <span className="text-muted-foreground">Waiting for events…</span>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="mb-2 last:mb-0">
                  <span className="text-muted-foreground">
                    [{new Date(ev.createdAt).toLocaleTimeString()}] {ev.kind}
                  </span>
                  {ev.payload != null ? (
                    <pre className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                      {JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {error ? (
        <p
          className="mt-3 flex items-start gap-2 text-sm text-amber-200/90"
          role="alert"
        >
          <Terminal className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </section>
  );
}
