import { NextResponse } from "next/server";
import { z } from "zod";

import { answerCarastaAssistantQuestion } from "@/lib/assistant/assistant-answer-service";
import { appendAssistantLog } from "@/lib/assistant/assistant-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const assistantQuestionSchema = z.object({
  question: z.string().min(3).max(2000),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = assistantQuestionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid question." }, { status: 400 });
  }

  try {
    const { answer, matchedChunks } = await answerCarastaAssistantQuestion(
      parsed.data.question
    );

    await appendAssistantLog({
      question: parsed.data.question,
      confidence: answer.confidence,
      shouldEscalate: answer.shouldEscalate,
      fallbackReason: answer.fallbackReason ?? null,
      sourceIds: matchedChunks.map((chunk) => chunk.sourceId),
      chunkIds: matchedChunks.map((chunk) => chunk.chunkId),
      scores: matchedChunks.map((chunk) => chunk.score ?? 0),
      matchedTerms: matchedChunks.flatMap((chunk) => chunk.matchedTerms ?? []),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(answer);
  } catch (error) {
    await appendAssistantLog({
      question: parsed.data.question,
      confidence: "low",
      shouldEscalate: true,
      sourceIds: [],
      chunkIds: [],
      error: error instanceof Error ? error.message : "UNKNOWN",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        answer:
          "I’m having trouble answering that right now. Please try again or use Resources or Contact if you need immediate help.",
        confidence: "low",
        shouldEscalate: true,
        suggestedQuestions: [
          "What is Carasta?",
          "What is Carmunity?",
          "How do auctions work on Carasta?",
          "Where should I go for help?",
        ],
        citations: [
          {
            sourceId: "trust-safety-and-help",
            title: "Trust Safety And Help",
            href: "/resources/trust-and-safety",
          },
        ],
      },
      { status: 200 }
    );
  }
}
