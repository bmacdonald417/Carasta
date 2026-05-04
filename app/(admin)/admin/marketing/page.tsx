import { getAdminMarketingPlatformSummary } from "@/lib/marketing/get-admin-marketing-platform-summary";
import { AdminMarketingClient } from "./marketing-client";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const s = await getAdminMarketingPlatformSummary();
  return <AdminMarketingClient data={s} />;
}
