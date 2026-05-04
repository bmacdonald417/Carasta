import { NextResponse } from "next/server";
import { z } from "zod";
import { retrieveAssistantChunks } from "@/lib/assistant/assistant-retrieval";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .min(1)
    .max(24),
  pageContext: z.string().max(300).optional(),
});

const SYSTEM_PROMPT = `You are the Carasta Assistant — a knowledgeable, friendly AI built into the Carasta platform.

You have TWO areas of expertise:

1. CARASTA PLATFORM — auctions, Carmunity community feed, garage, discussions, seller tools, profiles, bidding, trust & safety, messaging, how things work on the site.

2. AUTOMOTIVE EXPERTISE — you are a world-class car expert. You can help with:
   - Car specs, history, and comparisons for any make, model, and year
   - Car repair, diagnostics, and maintenance (OBD codes, symptoms, step-by-step fixes)
   - Buying and selling advice (what to inspect, fair prices, what to watch out for)
   - Classic and collector car knowledge, valuations, and rarity
   - Modifications, performance tuning, and aftermarket parts
   - Insurance, registration, titling, and ownership questions
   - Tire, brake, suspension, and drivetrain guidance
   - Any car-related question a user might have

Tone: Conversational, knowledgeable, and direct. Think of yourself as a trusted friend who's a certified mechanic AND knows the Carasta platform inside and out. Be warm but efficient — never verbose.

Format: Use **bold** for key terms, bullet lists for steps or comparisons, and code blocks for OBD codes. Keep answers focused.

Rules:
- Never fabricate Carasta-specific policy certainty (exact fees, moderation decisions, account-specific state). For those, acknowledge the limits and point to Contact.
- For automotive questions, answer confidently and with real depth. Don't hedge excessively.
- If the user is on a specific Carasta page (see Page Context), tailor your answer to help them with what they're looking at.
- Always be helpful. Never refuse a reasonable automotive or platform question.
- If you're unsure about a specific repair, recommend professional inspection but still give useful context.
`;

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const { messages, pageContext } = parsed.data;
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // Retrieve relevant Carasta knowledge chunks for platform questions
  let contextBlock = "";
  try {
    const chunks = await retrieveAssistantChunks(lastUserMessage, 5);
    if (chunks.length > 0) {
      contextBlock =
        "\n\nRELEVANT CARASTA KNOWLEDGE (use when answering platform questions):\n" +
        chunks
          .map((c) => `[${c.title} — ${c.heading}]\n${c.content}`)
          .join("\n\n");
    }
  } catch {
    // retrieval failure is non-fatal — assistant still works with base knowledge
  }

  const pageBlock = pageContext
    ? `\n\nPage Context (user's current page): ${pageContext}`
    : "";

  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      { message: "OpenAI API key not configured." },
      { status: 500 }
    );
  }

  const model =
    process.env.MARKETING_COPILOT_MODEL?.trim() || "gpt-4o-mini";

  const openaiMessages = [
    { role: "system", content: SYSTEM_PROMPT + contextBlock + pageBlock },
    ...messages,
  ];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        max_tokens: 1400,
        temperature: 0.45,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text();
      return NextResponse.json(
        { message: `OpenAI error: ${errText}` },
        { status: 502 }
      );
    }

    const reader = res.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(encoder.encode(decoder.decode(value)));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
