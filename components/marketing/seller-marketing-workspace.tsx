"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ListingMarketingArtifactType,
  ListingMarketingTaskStatus,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  SellerMarketingCopilot,
  type SellerMarketingListingCapsule,
} from "@/components/marketing/seller-marketing-copilot";
import type { MarketingCopilotIntakeMetricsSnapshot } from "@/lib/marketing/marketing-copilot-intake-metrics";
import { SellerSectionPanel } from "@/components/marketing/seller-workspace-primitives";

export type WorkspacePlanState = {
  id: string;
  auctionId: string;
  createdById: string;
  objective: string;
  audience: string;
  positioning: string;
  channels: unknown;
  createdAt: string;
  updatedAt: string;
  tasks?: WorkspaceTaskState[];
  artifacts?: WorkspaceArtifactState[];
};

export type WorkspaceTaskState = {
  id: string;
  planId: string;
  type: string;
  title: string;
  description: string;
  channel: string | null;
  status: string;
  sortOrder: number;
  completedAt: string | null;
};

export type WorkspaceArtifactState = {
  id: string;
  planId: string;
  type: string;
  channel: string;
  content: string;
  version: number;
  createdAt: string;
};

function channelsToInput(channels: unknown): string {
  if (Array.isArray(channels)) {
    return (channels as string[]).join(", ");
  }
  if (typeof channels === "string") return channels;
  return "";
}

const ARTIFACT_TYPES = Object.values(ListingMarketingArtifactType);

type Props = {
  auctionId: string;
  initialPlan: WorkspacePlanState | null;
  listingCapsule: SellerMarketingListingCapsule;
  copilotConfigured: boolean;
  /** Optional dashboard snapshot for copilot intake (per-listing marketing page). */
  copilotIntakeMetrics?: MarketingCopilotIntakeMetricsSnapshot | null;
};

export function SellerMarketingWorkspace({
  auctionId,
  initialPlan,
  listingCapsule,
  copilotConfigured,
  copilotIntakeMetrics = null,
}: Props) {
  const [plan, setPlan] = useState<WorkspacePlanState | null>(initialPlan);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draftObjective, setDraftObjective] = useState(initialPlan?.objective ?? "");
  const [draftAudience, setDraftAudience] = useState(initialPlan?.audience ?? "");
  const [draftPositioning, setDraftPositioning] = useState(initialPlan?.positioning ?? "");
  const [draftChannels, setDraftChannels] = useState(
    channelsToInput(initialPlan?.channels)
  );

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const [artifactType, setArtifactType] = useState<ListingMarketingArtifactType>(
    ListingMarketingArtifactType.CAPTION
  );
  const [artifactChannel, setArtifactChannel] = useState("");
  const [artifactContent, setArtifactContent] = useState("");

  const refreshPlan = useCallback(async () => {
    const res = await fetch(`/api/marketing/plan/auction/${auctionId}`);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error((j as { message?: string }).message ?? "Failed to load plan.");
    }
    const j = (await res.json()) as { plan: WorkspacePlanState | null };
    setPlan(j.plan);
    if (j.plan) {
      setDraftObjective(j.plan.objective);
      setDraftAudience(j.plan.audience);
      setDraftPositioning(j.plan.positioning);
      setDraftChannels(channelsToInput(j.plan.channels));
    }
  }, [auctionId]);

  const run = useCallback(async (fn: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }, []);

  const createPlan = () =>
    run(async () => {
      const channels = draftChannels
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/marketing/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId,
          objective: draftObjective,
          audience: draftAudience,
          positioning: draftPositioning,
          channels,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { message?: string }).message ?? "Could not create plan.");
      }
      const j = (await res.json()) as { plan: WorkspacePlanState };
      setPlan(j.plan);
    });

  const savePlan = () =>
    run(async () => {
      if (!plan) return;
      const channels = draftChannels
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(`/api/marketing/plan/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: draftObjective,
          audience: draftAudience,
          positioning: draftPositioning,
          channels,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { message?: string }).message ?? "Could not save plan.");
      }
      const j = (await res.json()) as { plan: WorkspacePlanState };
      setPlan(j.plan);
    });

  const addTask = () =>
    run(async () => {
      if (!plan) return;
      const title = newTaskTitle.trim();
      if (!title) throw new Error("Task title is required.");
      const res = await fetch("/api/marketing/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          title,
          description: newTaskDescription.trim(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { message?: string }).message ?? "Could not add task.");
      }
      setNewTaskTitle("");
      setNewTaskDescription("");
      await refreshPlan();
    });

  const toggleTask = (task: WorkspaceTaskState) =>
    run(async () => {
      const next =
        task.status === ListingMarketingTaskStatus.COMPLETED
          ? ListingMarketingTaskStatus.PENDING
          : ListingMarketingTaskStatus.COMPLETED;
      const res = await fetch(`/api/marketing/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { message?: string }).message ?? "Could not update task.");
      }
      await refreshPlan();
    });

  const saveArtifact = () =>
    run(async () => {
      if (!plan) return;
      const content = artifactContent.trim();
      if (!content) throw new Error("Draft content is required.");
      const res = await fetch("/api/marketing/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          type: artifactType,
          channel: artifactChannel.trim(),
          content,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { message?: string }).message ?? "Could not save draft.");
      }
      setArtifactContent("");
      await refreshPlan();
    });

  const tasks = plan?.tasks ?? [];

  const sortedArtifacts = useMemo(
    () => [...(plan?.artifacts ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [plan?.artifacts]
  );

  return (
    <SellerSectionPanel
      id="marketing-workspace"
      title="Workspace plan, tasks, and content"
      description="The listing workspace now acts like an execution layer: plan first, then checklist, then versioned content drafts."
      className="scroll-mt-32 mt-10"
    >
      {error ? (
        <p className="rounded-2xl border border-[hsl(var(--seller-urgency))]/20 bg-[hsl(var(--seller-urgency-soft))] px-3 py-2 text-sm text-[hsl(var(--seller-urgency-foreground))]">
          {error}
        </p>
      ) : null}

      <SellerMarketingCopilot
        auctionId={auctionId}
        listingCapsule={listingCapsule}
        intakeMetrics={copilotIntakeMetrics}
        workspacePlan={
          plan
            ? {
                id: plan.id,
                objective: plan.objective,
                audience: plan.audience,
                positioning: plan.positioning,
                channels: plan.channels,
              }
            : null
        }
        copilotConfigured={copilotConfigured}
        onApplied={refreshPlan}
      />

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--seller-muted))]">
          Marketing plan
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <p className="text-xs text-[hsl(var(--seller-muted))]">Objective</p>
            <Textarea
              value={draftObjective}
              onChange={(e) => setDraftObjective(e.target.value)}
              rows={2}
              className="resize-y border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] text-[hsl(var(--seller-foreground))]"
              placeholder="What you want this listing to achieve…"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-[hsl(var(--seller-muted))]">Audience</p>
            <Textarea
              value={draftAudience}
              onChange={(e) => setDraftAudience(e.target.value)}
              rows={3}
              className="resize-y border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] text-[hsl(var(--seller-foreground))]"
              placeholder="Who should see this listing?"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-[hsl(var(--seller-muted))]">Positioning</p>
            <Textarea
              value={draftPositioning}
              onChange={(e) => setDraftPositioning(e.target.value)}
              rows={3}
              className="resize-y border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] text-[hsl(var(--seller-foreground))]"
              placeholder="Why this car, why now…"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <p className="text-xs text-[hsl(var(--seller-muted))]">Channels (comma-separated)</p>
            <Input
              value={draftChannels}
              onChange={(e) => setDraftChannels(e.target.value)}
              className="border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] text-[hsl(var(--seller-foreground))]"
              placeholder="carmunity, instagram, email"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!plan ? (
            <Button type="button" size="sm" disabled={busy} onClick={() => void createPlan()}>
              Create plan
            </Button>
          ) : (
            <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void savePlan()}>
              Save plan
            </Button>
          )}
        </div>
      </section>

      {plan ? (
        <section className="space-y-4 border-t border-[hsl(var(--seller-border))] pt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--seller-muted))]">
            Execution checklist
          </h3>
          <ul className="space-y-2">
            {tasks.length === 0 ? (
              <li className="text-sm text-[hsl(var(--seller-muted))]">No tasks yet.</li>
            ) : (
              tasks.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] px-3 py-3"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--seller-info))]"
                    checked={t.status === ListingMarketingTaskStatus.COMPLETED}
                    disabled={busy}
                    onChange={() => void toggleTask(t)}
                    aria-label={`Complete: ${t.title}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium text-[hsl(var(--seller-foreground))] ${
                        t.status === ListingMarketingTaskStatus.COMPLETED
                          ? "text-[hsl(var(--seller-muted))] line-through"
                          : ""
                      }`}
                    >
                      {t.title}
                    </p>
                    {t.description ? (
                      <p className="mt-0.5 text-xs text-[hsl(var(--seller-muted))]">{t.description}</p>
                    ) : null}
                    {t.channel ? (
                      <p className="mt-0.5 text-[10px] uppercase text-[hsl(var(--seller-muted))]">
                        {t.channel}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs text-[hsl(var(--seller-muted))]">New task title</p>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] text-[hsl(var(--seller-foreground))]"
                placeholder="e.g. Post teaser to Instagram"
              />
            </div>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void addTask()}>
              Add task
            </Button>
          </div>
          <Textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            rows={2}
            className="resize-y border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] text-[hsl(var(--seller-foreground))]"
            placeholder="Optional details…"
          />
        </section>
      ) : null}

      {plan ? (
        <section className="space-y-4 border-t border-[hsl(var(--seller-border))] pt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--seller-muted))]">
            Content drafts
          </h3>
          <p className="text-xs text-[hsl(var(--seller-muted))]">
            Each save creates a new version for the same type + channel key.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-[hsl(var(--seller-muted))]">Type</p>
              <select
                className="h-10 w-full rounded-2xl border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] px-3 text-sm text-[hsl(var(--seller-foreground))]"
                value={artifactType}
                onChange={(e) =>
                  setArtifactType(e.target.value as ListingMarketingArtifactType)
                }
              >
                {ARTIFACT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[hsl(var(--seller-muted))]">Channel label (optional)</p>
              <Input
                value={artifactChannel}
                onChange={(e) => setArtifactChannel(e.target.value)}
                className="border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] text-[hsl(var(--seller-foreground))]"
                placeholder="instagram, carmunity, …"
              />
            </div>
          </div>
          <Textarea
            value={artifactContent}
            onChange={(e) => setArtifactContent(e.target.value)}
            rows={5}
            className="resize-y border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] text-[hsl(var(--seller-foreground))]"
            placeholder="Draft caption, headline, or notes…"
          />
          <Button type="button" size="sm" disabled={busy} onClick={() => void saveArtifact()}>
            Save new version
          </Button>

          <div className="mt-4 space-y-3">
            {sortedArtifacts.length === 0 ? (
              <p className="text-sm text-[hsl(var(--seller-muted))]">No drafts yet.</p>
            ) : (
              sortedArtifacts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[hsl(var(--seller-muted))]">
                    <span>
                      {a.type}
                      {a.channel ? ` · ${a.channel}` : ""}
                    </span>
                    <span>
                      v{a.version} · {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-[hsl(var(--seller-foreground))]">
                    {a.content}
                  </pre>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}
    </SellerSectionPanel>
  );
}
