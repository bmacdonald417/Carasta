#!/usr/bin/env node
/**
 * Placeholder for a local "incorporate feedback" runner.
 * Expected env (set in your shell or .env loaded by your runner):
 *   DATABASE_URL
 *   ANTHROPIC_API_KEY   — your Claude / tooling key
 *   GITHUB_TOKEN         — repo access for PRs/commits if your routine uses GitHub
 *   AGENT_SHIM_SECRET    — must match the app; send as header x-agent-shim-secret
 *
 * Implement your routine to:
 *   1) SELECT pending/reviewed rows from `feedback`
 *   2) Apply code fixes
 *   3) PATCH `/api/agent/run/:id/status` when finished
 *   4) POST `/api/agent/run/:id/events` for progress logs
 */
const required = ["DATABASE_URL"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("Missing env:", missing.join(", "));
  process.exit(1);
}

console.log(
  "run-feedback-agent: stub only. Wire your Claude Code job to hit /api/agent/run/* with AGENT_SHIM_SECRET."
);
process.exit(0);
