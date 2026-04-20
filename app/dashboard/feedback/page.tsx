import { prisma } from "@/lib/db";
import { getFeedbackOrganizationId } from "@/lib/feedback-org";
import FeedbackDashboardClient, {
  type FeedbackRowVM,
} from "@/components/feedback/FeedbackDashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardFeedbackPage() {
  const organizationId = getFeedbackOrganizationId();
  const rows = await prisma.elementFeedback.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 400,
  });

  const initial: FeedbackRowVM[] = rows.map((r) => ({
    id: r.id,
    content: r.content,
    category: r.category,
    pageUrl: r.pageUrl,
    elementSelector: r.elementSelector,
    elementText: r.elementText,
    elementType: r.elementType,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
    resolutionCommitSha: r.resolutionCommitSha,
    resolutionCommitUrl: r.resolutionCommitUrl,
    resolutionSummary: r.resolutionSummary,
    resolutionFiles: r.resolutionFiles,
  }));

  return <FeedbackDashboardClient initialRows={initial} />;
}
