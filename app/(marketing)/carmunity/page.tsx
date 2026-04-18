import { redirect } from "next/navigation";

/**
 * Friendly alias for the Carmunity feed. Canonical content lives at `/explore`
 * to avoid breaking existing links and API usage in this phase.
 */
export default function CarmunityAliasPage() {
  redirect("/explore");
}
