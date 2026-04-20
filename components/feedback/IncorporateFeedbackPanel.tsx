"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AgentRunEventDto } from "./types";
import { Loader2, Play, Terminal } from "lucide-react";

type Props = {
  className?: string;
};

/**
 * Starts a server-side agent run and polls events with backoff on errors.
 */
export default function IncorporateFeedbackPanel({ className }: Props) {
  const [runId, setRunId] = useState<string | null>(null);
  const [events, setEvents] = useState<AgentRunEventDto[]>([]);
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
      const res = await fetch(`/api/agent/run/${id}/events`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Poll failed (${res.status})`);
      }
      const data = (await res.json()) as { events: AgentRunEventDto[] };
      setEvents(data.events ?? []);
      setError(null);
      attempt.current = 0;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Poll error";
      setError(msg);
      attempt.current += 1;
    } finally {
      const backoff = Math.min(30_000, 800 * 2 ** attempt.current);
      clearTimer();
      timer.current = setTimeout(() => void poll(id), backoff);
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

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/5 p-5 ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-wide text-neutral-100">
            Incorporate feedback
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Creates an agent run and event log. Wire your Claude Code routine or
            local script to the shim endpoints.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-2xl"
          onClick={() => void start()}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Start agent run
        </Button>
      </div>

      {runId ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-neutral-500">
            Run <span className="font-mono text-neutral-300">{runId}</span>
          </p>
          <div className="max-h-56 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-emerald-100/90">
            {events.length === 0 ? (
              <span className="text-neutral-500">Waiting for events…</span>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="mb-2 last:mb-0">
                  <span className="text-neutral-500">
                    [{ev.createdAt}] {ev.kind}
                  </span>
                  {ev.payload != null ? (
                    <pre className="mt-1 whitespace-pre-wrap break-words text-neutral-300">
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
