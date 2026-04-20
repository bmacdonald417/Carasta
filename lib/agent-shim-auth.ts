import type { NextRequest } from "next/server";

const HEADER = "x-agent-shim-secret";

export function validateAgentShimRequest(req: NextRequest): boolean {
  const secret = process.env.AGENT_SHIM_SECRET?.trim();
  if (!secret) return false;
  const got = req.headers.get(HEADER)?.trim();
  return Boolean(got && got === secret);
}

export function agentShimHeaders(): Record<string, string> {
  const secret = process.env.AGENT_SHIM_SECRET?.trim();
  if (!secret) return {};
  return { [HEADER]: secret };
}
