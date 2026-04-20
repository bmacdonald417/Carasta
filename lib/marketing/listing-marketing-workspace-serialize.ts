export function serializeWorkspaceTask(t: {
  id: string;
  planId: string;
  type: string;
  title: string;
  description: string;
  channel: string | null;
  status: string;
  sortOrder: number;
  completedAt: Date | null;
}) {
  return {
    id: t.id,
    planId: t.planId,
    type: t.type,
    title: t.title,
    description: t.description,
    channel: t.channel,
    status: t.status,
    sortOrder: t.sortOrder,
    completedAt: t.completedAt?.toISOString() ?? null,
  };
}

export function serializeWorkspaceArtifact(a: {
  id: string;
  planId: string;
  type: string;
  channel: string;
  content: string;
  version: number;
  createdAt: Date;
}) {
  return {
    id: a.id,
    planId: a.planId,
    type: a.type,
    channel: a.channel,
    content: a.content,
    version: a.version,
    createdAt: a.createdAt.toISOString(),
  };
}

export function serializeWorkspacePlan(plan: {
  id: string;
  auctionId: string;
  createdById: string;
  objective: string;
  audience: string;
  positioning: string;
  channels: unknown;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Array<{
    id: string;
    planId: string;
    type: string;
    title: string;
    description: string;
    channel: string | null;
    status: string;
    sortOrder: number;
    completedAt: Date | null;
  }>;
  artifacts?: Array<{
    id: string;
    planId: string;
    type: string;
    channel: string;
    content: string;
    version: number;
    createdAt: Date;
  }>;
}) {
  return {
    id: plan.id,
    auctionId: plan.auctionId,
    createdById: plan.createdById,
    objective: plan.objective,
    audience: plan.audience,
    positioning: plan.positioning,
    channels: plan.channels,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    tasks: plan.tasks?.map(serializeWorkspaceTask),
    artifacts: plan.artifacts?.map(serializeWorkspaceArtifact),
  };
}
