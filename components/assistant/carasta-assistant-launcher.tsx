"use client";

import { useMemo, useState } from "react";
import { Bot, ExternalLink, Loader2, MessageCircleQuestion, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AssistantReply = {
  answer: string;
  confidence: "high" | "medium" | "low";
  shouldEscalate: boolean;
  fallbackReason?: string;
  recommendedRoutes?: Array<{
    label: string;
    href: string;
    reason: string;
  }>;
  suggestedQuestions: string[];
  citations: Array<{
    sourceId: string;
    title: string;
    href: string;
    heading?: string;
    category?: string;
  }>;
};

const EXAMPLE_PROMPTS = [
  "What is Carasta?",
  "What is Carmunity?",
  "How do auctions work on Carasta?",
  "What do seller tools mean on Carasta?",
];

export function CarastaAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capabilityCopy = useMemo(
    () =>
      [
        "site and product understanding",
        "platform concepts like Carmunity, Discussions, Garage, and Messages",
        "general buyer and seller workflow guidance",
        "where to go for help",
      ].join(", "),
    []
  );

  async function askAssistant(nextQuestion?: string) {
    const prompt = (nextQuestion ?? question).trim();
    if (!prompt) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/assistant/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt }),
      });
      const data = (await res.json()) as AssistantReply & { message?: string };
      if (!res.ok) {
        throw new Error(data.message ?? "Assistant request failed.");
      }
      setQuestion(prompt);
      setReply(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant request failed.");
      setReply(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open Carasta Assistant"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-950 shadow-[0_18px_60px_-26px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50"
      >
        <MessageCircleQuestion className="h-4 w-4 text-primary" />
        Carasta Assistant
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-neutral-200 bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] text-neutral-950">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-2xl tracking-[0.02em] text-neutral-950">
                  Carasta Assistant
                </DialogTitle>
                <DialogDescription className="mt-1 max-w-2xl text-neutral-600">
                  A bounded Carasta help assistant for {capabilityCopy}. It is
                  grounded in curated Carasta content and points back to source
                  pages when possible.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
              Boundaries
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              This assistant does not give legal advice, make moderation
              decisions, or claim account-specific certainty. If the source
              content is thin or ambiguous, it should say so and point you to
              the right help page instead of bluffing.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <label className="text-sm font-semibold text-neutral-950">
              Ask about the product or how the platform works
            </label>
            <Textarea
              rows={4}
              className="mt-3 resize-y border-neutral-200 bg-neutral-50 text-neutral-950"
              placeholder="Example: What is Carmunity and how is it different from Discussions?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void askAssistant(prompt)}
                  disabled={busy}
                >
                  {prompt}
                </Button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="button" onClick={() => void askAssistant()} disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Asking…
                  </>
                ) : (
                  "Ask assistant"
                )}
              </Button>
            </div>
          </div>

          {error ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {reply ? (
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">
                    Confidence: {reply.confidence}
                  </span>
                  {reply.shouldEscalate ? (
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                      Support may be better
                    </span>
                  ) : null}
                </div>
                {reply.confidence !== "high" ? (
                  <p className="mt-3 text-xs text-neutral-500">
                    This answer is intentionally cautious and may be routing you
                    to the most relevant source rather than claiming certainty.
                  </p>
                ) : null}
                <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                  {reply.answer}
                </div>
              </div>

              {reply.citations.length > 0 ? (
                <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5">
                  <p className="text-sm font-semibold text-neutral-950">
                    Sources
                  </p>
                  <div className="mt-3 grid gap-3">
                    {reply.citations.map((citation) => (
                      <a
                        key={`${citation.sourceId}:${citation.heading ?? "root"}`}
                        href={citation.href}
                        className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                      >
                        <span className="font-semibold text-neutral-950">
                          {citation.title}
                        </span>
                        {citation.category ? (
                          <span className="ml-2 text-neutral-400">
                            [{citation.category}]
                          </span>
                        ) : null}
                        {citation.heading ? (
                          <span className="ml-2 text-neutral-500">
                            · {citation.heading}
                          </span>
                        ) : null}
                        <span className="ml-2 inline-flex align-middle text-neutral-500">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {reply.suggestedQuestions.length > 0 ? (
                <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-neutral-950">
                    Suggested follow-ups
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {reply.suggestedQuestions.map((prompt) => (
                      <Button
                        key={prompt}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void askAssistant(prompt)}
                        disabled={busy}
                      >
                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {reply.shouldEscalate ? (
                <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                  <p className="font-semibold">Need more help?</p>
                  <p className="mt-2 leading-6">
                    If this question needs support beyond general product
                    guidance, use the next step that best fits the situation.
                  </p>
                  {reply.recommendedRoutes && reply.recommendedRoutes.length > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {reply.recommendedRoutes.map((route) => (
                        <a
                          key={`${route.href}:${route.label}`}
                          href={route.href}
                          className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-amber-900 transition hover:border-amber-300 hover:bg-amber-50"
                        >
                          <span className="block font-semibold">{route.label}</span>
                          <span className="mt-1 block text-xs leading-5 text-amber-700">
                            {route.reason}
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
              Ask about platform concepts, buying or selling basics, trust and
              safety, or where to find help. This assistant is grounded in a
              curated Carasta knowledge set rather than open-ended prompt memory.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
