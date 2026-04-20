/**
 * Phase L — minimal server-side usage signals (structured logs only).
 * No third-party analytics SDK; safe to pipe from hosting log drains.
 */
export function logCarmunityEvent(input: {
  type: string;
  userId?: string | null;
  meta?: Record<string, unknown>;
}): void {
  const line = JSON.stringify({
    source: "carmunity",
    ts: new Date().toISOString(),
    type: input.type,
    userId: input.userId ?? undefined,
    meta: input.meta ?? undefined,
  });
  if (process.env.NODE_ENV === "production") {
    console.log(line);
  } else {
    console.debug(line);
  }
}
