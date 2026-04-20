/**
 * Listing copy AI (sell wizard). Requires explicit opt-in and OpenAI server key.
 * Env: LISTING_AI_ENABLED=true, OPENAI_API_KEY
 */
export function isListingAiEnabled(): boolean {
  return process.env.LISTING_AI_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY?.trim());
}
