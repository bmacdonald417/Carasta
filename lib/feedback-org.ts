/**
 * Carasta is single-tenant for feedback today: one logical org id stored on every row.
 * Override with CARASTA_FEEDBACK_ORG_ID when you introduce real organizations.
 */
export function getFeedbackOrganizationId(): string {
  const fromEnv = process.env.CARASTA_FEEDBACK_ORG_ID?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : "carasta";
}
