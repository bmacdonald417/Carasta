/** API + UI contract for the Element Feedback Kit (Carasta port). */

export type FeedbackCategory = "bug" | "ux" | "feature" | "general";

export type FeedbackStatus = "pending" | "reviewed" | "resolved";

export type PinnedElement = {
  selector: string;
  text: string;
  type: string;
  idAttr?: string;
  classAttr?: string;
};

export type FeedbackSubmitBody = {
  content: string;
  category: FeedbackCategory;
  pageUrl?: string;
  elementSelector?: string;
  elementText?: string;
  elementType?: string;
  elementIdAttr?: string;
  elementClassAttr?: string;
};

export type FeedbackPatchBody = {
  id: string;
  status: FeedbackStatus;
  resolutionCommitSha?: string | null;
  resolutionCommitUrl?: string | null;
  resolutionSummary?: string | null;
  resolutionFiles?: unknown;
};

export type AgentRunEventDto = {
  id: string;
  kind: string;
  payload: unknown;
  createdAt: string;
};
