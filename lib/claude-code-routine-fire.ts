/**
 * POST https://api.anthropic.com/v1/claude_code/routines/{routine_id}/fire
 * @see https://platform.claude.com/docs/en/api/claude-code/routines-fire
 *
 * Uses the per-routine bearer token from Claude Code → Routines → API trigger (not Console API keys).
 */

export type RoutineFireResult =
  | { status: "ok"; data: unknown }
  | { status: "skipped"; reason: string }
  | { status: "error"; httpStatus: number; message: string };

function routineFireUrl(): string | null {
  const override = process.env.CLAUDE_CODE_ROUTINE_FIRE_URL?.trim();
  if (override) return override;

  const routineId = process.env.CLAUDE_CODE_ROUTINE_ID?.trim();
  if (!routineId) return null;

  return `https://api.anthropic.com/v1/claude_code/routines/${encodeURIComponent(routineId)}/fire`;
}

export async function fireClaudeCodeRoutine(input: {
  text: string;
}): Promise<RoutineFireResult> {
  const token = process.env.CLAUDE_CODE_ROUTINE_TOKEN?.trim();
  if (!token) {
    return {
      status: "skipped",
      reason: "CLAUDE_CODE_ROUTINE_TOKEN is unset (generate an API trigger token in claude.ai/code/routines).",
    };
  }

  const url = routineFireUrl();
  if (!url) {
    return {
      status: "skipped",
      reason:
        "Set CLAUDE_CODE_ROUTINE_FIRE_URL (full POST URL from the routine modal) or CLAUDE_CODE_ROUTINE_ID (e.g. trig_…).",
    };
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 60_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "experimental-cc-routine-2026-04-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input.text }),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(t);
    const msg = e instanceof Error ? e.message : String(e);
    return {
      status: "error",
      httpStatus: 0,
      message: msg.slice(0, 2000),
    };
  } finally {
    clearTimeout(t);
  }

  const raw = await res.text();
  let data: unknown = raw;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!res.ok) {
    let message: string;
    if (typeof data === "object" && data !== null && "error" in data) {
      message = JSON.stringify((data as { error: unknown }).error);
    } else {
      message = typeof data === "string" ? data : raw;
    }
    return {
      status: "error",
      httpStatus: res.status,
      message: message.slice(0, 2000),
    };
  }

  return { status: "ok", data };
}
