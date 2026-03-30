/**
 * Sends a single marketing digest via [Resend](https://resend.com) HTTP API.
 * No extra npm deps — `fetch` only.
 *
 * Env:
 * - `RESEND_API_KEY` — required for real delivery
 * - `MARKETING_DIGEST_FROM` — e.g. `Carasta <digest@yourdomain.com>` (verified sender in Resend)
 */

export type SendMarketingDigestResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; skipped?: boolean };

export async function sendMarketingDigestEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendMarketingDigestResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MARKETING_DIGEST_FROM?.trim();

  if (!apiKey) {
    return {
      ok: false,
      skipped: true,
      error: "RESEND_API_KEY not set — configure Resend or run with --dry-run.",
    };
  }
  if (!from) {
    return {
      ok: false,
      skipped: true,
      error: "MARKETING_DIGEST_FROM not set.",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      error: body.message || `Resend error HTTP ${res.status}`,
    };
  }

  return { ok: true, id: body.id };
}
