/**
 * Seeded demo users from prisma/seed.ts — allowed for dev-only Carmunity demo login.
 * Do not use in production routes without additional guards.
 */
export const DEMO_SEED_EMAILS = [
  "tom@example.com",
  "flat6@example.com",
  "v8vince@example.com",
  "jdm@example.com",
  "classic@example.com",
  "rally@example.com",
  "collector@example.com",
  "dealer@example.com",
] as const;

export function isDemoSeedEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  return (DEMO_SEED_EMAILS as readonly string[]).includes(e);
}

export function assertCarmunityDemoApisEnabled(): Response | null {
  if (process.env.NODE_ENV !== "development") {
    return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}
