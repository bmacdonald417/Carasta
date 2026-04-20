"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type MentionSuggestion = {
  handle: string;
  name: string | null;
  tier: string;
};

function parseMention(text: string, caret: number) {
  const before = text.slice(0, caret);
  const m = before.match(/@([a-zA-Z0-9_]*)$/);
  if (!m) return null;
  const query = m[1] ?? "";
  const start = caret - m[0].length;
  return { query, start, caret };
}

function tierLabel(tier: string) {
  if (tier === "following") return "Following";
  if (tier === "participant") return "In thread";
  if (tier === "recent") return "Recent";
  return "Community";
}

type MentionComposerTextareaProps = Omit<React.ComponentProps<typeof Textarea>, "onChange" | "value"> & {
  value: string;
  onChange: (next: string) => void;
  threadId?: string | null;
};

export function MentionComposerTextarea({
  value,
  onChange,
  threadId,
  className,
  onKeyDown: onKeyDownProp,
  ...rest
}: MentionComposerTextareaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const listId = useId();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MentionSuggestion[]>([]);
  const [mention, setMention] = useState<{ query: string; start: number; caret: number } | null>(
    null
  );

  const syncMention = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? value.length;
    const m = parseMention(value, caret);
    setMention(m);
    if (!m) {
      setOpen(false);
      setItems([]);
      setActive(0);
      return;
    }
    setOpen(true);
    setActive(0);
  }, [value]);

  const fetchSuggestions = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        const params = new URLSearchParams();
        if (query.length > 0) params.set("q", query);
        if (threadId) params.set("threadId", threadId);
        const qs = params.toString();
        setLoading(true);
        void fetch(`/api/carmunity/mention-suggestions${qs ? `?${qs}` : ""}`, {
          signal: ac.signal,
          credentials: "same-origin",
        })
          .then((r) => r.json() as Promise<{ handles?: MentionSuggestion[] }>)
          .then((data) => {
            setItems(Array.isArray(data.handles) ? data.handles : []);
          })
          .catch(() => {
            if (ac.signal.aborted) return;
            setItems([]);
          })
          .finally(() => {
            if (!ac.signal.aborted) setLoading(false);
          });
      }, 120);
    },
    [threadId]
  );

  useEffect(() => {
    if (!mention) return;
    fetchSuggestions(mention.query);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [mention, fetchSuggestions]);

  const canNavigate = open && items.length > 0;

  const insert = useCallback(
    (handle: string) => {
      const el = taRef.current;
      const m = mention;
      if (!el || !m) return;
      const caret = el.selectionStart ?? value.length;
      const before = value.slice(0, m.start);
      const after = value.slice(caret);
      const next = `${before}@${handle} ${after}`;
      onChange(next);
      setOpen(false);
      setMention(null);
      requestAnimationFrame(() => {
        el.focus();
        const pos = m.start + handle.length + 2;
        try {
          el.setSelectionRange(pos, pos);
        } catch {
          /* noop */
        }
      });
    },
    [mention, onChange, value]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDownProp?.(e);
      if (e.defaultPrevented) return;
      if (!open || !canNavigate) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + items.length) % items.length);
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const pick = items[active];
        if (pick) insert(pick.handle);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    },
    [active, canNavigate, insert, items, onKeyDownProp, open]
  );

  const hint = useMemo(() => {
    if (!mention) return null;
    if (mention.query.length === 0) return "People you follow and thread context appear first.";
    return null;
  }, [mention]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Textarea
        ref={taRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          requestAnimationFrame(() => syncMention());
        }}
        onSelect={syncMention}
        onClick={syncMention}
        onKeyUp={syncMention}
        onKeyDown={onKeyDown}
        className={cn(className)}
        aria-autocomplete={open ? "list" : undefined}
        aria-controls={open ? listId : undefined}
        aria-expanded={open}
        {...rest}
      />

      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border/60 bg-popover/95 p-1 text-popover-foreground shadow-lg backdrop-blur-sm"
        >
          {loading && items.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>
          ) : null}
          {!loading && items.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No matches — keep typing a handle, or check spelling.
            </p>
          ) : null}
          {hint && items.length > 0 ? (
            <p className="px-3 pb-1 text-[11px] text-muted-foreground">{hint}</p>
          ) : null}
          <ul className="space-y-0.5">
            {items.map((it, idx) => (
              <li key={it.handle}>
                <button
                  type="button"
                  role="option"
                  aria-selected={idx === active}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                    idx === active ? "bg-primary/10 text-primary" : "hover:bg-muted/40"
                  )}
                  onMouseEnter={() => setActive(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insert(it.handle)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">@{it.handle}</span>
                    {it.name ? (
                      <span className="block truncate text-xs text-muted-foreground">{it.name}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 rounded-full border border-border/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {tierLabel(it.tier)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
