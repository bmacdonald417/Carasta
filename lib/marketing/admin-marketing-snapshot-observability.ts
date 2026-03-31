/**
 * Lightweight observability for **`GET /api/admin/marketing/snapshot`**.
 *
 * - **In-memory counters** (per Node instance): one key per HTTP outcome — bounded key space.
 * - **Structured logs** (`console.info`): **401** / **500** by default; **200** / **304** only when
 *   **`ADMIN_MARKETING_SNAPSHOT_OBSERVABILITY_VERBOSE=1`** (or `true` / `yes`).
 *
 * **Privacy:** No session data, IPs, or snapshot payload. Only outcome labels.
 *
 * **Limitations:** Same as marketing track observability — **per-process only**; not shared across
 * serverless instances until aggregated via logs / external metrics.
 */

export type AdminMarketingSnapshotObserveOutcome =
  | "snapshot_200"
  | "snapshot_304"
  | "snapshot_401"
  | "snapshot_500";

const counters = new Map<AdminMarketingSnapshotObserveOutcome, number>();

function isVerboseLogging(): boolean {
  const v =
    process.env.ADMIN_MARKETING_SNAPSHOT_OBSERVABILITY_VERBOSE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function shouldLogLine(outcome: AdminMarketingSnapshotObserveOutcome): boolean {
  if (isVerboseLogging()) return true;
  return outcome === "snapshot_401" || outcome === "snapshot_500";
}

/**
 * Increment counters and optionally emit one structured log line.
 */
export function observeAdminMarketingSnapshot(
  outcome: AdminMarketingSnapshotObserveOutcome
): void {
  counters.set(outcome, (counters.get(outcome) ?? 0) + 1);

  if (!shouldLogLine(outcome)) return;
  console.info(
    "[admin-marketing-snapshot]",
    JSON.stringify({ outcome })
  );
}

/**
 * Snapshot of in-memory counters for this process (debugging, future wiring).
 */
export function getAdminMarketingSnapshotObservabilitySnapshot(): Record<
  string,
  number
> {
  const out: Record<string, number> = {};
  for (const k of Array.from(counters.keys()).sort()) {
    out[k] = counters.get(k) ?? 0;
  }
  return out;
}
