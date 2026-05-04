"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Bot,
  Car,
  ChevronDown,
  Loader2,
  Send,
  Sparkles,
  Wrench,
  X,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FLOATING_PILL_LAUNCHER_CLASS } from "@/components/shell/floating-launcher-styles";
import { usePathname } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

type SuggestedPrompt = {
  label: string;
  prompt: string;
  icon: React.ReactNode;
};

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    label: "How do auctions work?",
    prompt: "How do auctions work on Carasta? Walk me through bidding, reserve prices, and buy-now.",
    icon: <Car className="h-3.5 w-3.5" />,
  },
  {
    label: "Diagnose a car problem",
    prompt: "My check engine light is on and the car is idling rough. What could be causing this?",
    icon: <Wrench className="h-3.5 w-3.5" />,
  },
  {
    label: "What is Carmunity?",
    prompt: "What is Carmunity and how is it different from the auction side of Carasta?",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  {
    label: "Inspect a used car",
    prompt: "What should I inspect and look for when buying a used collector car? Give me a checklist.",
    icon: <Car className="h-3.5 w-3.5" />,
  },
  {
    label: "Classic car values",
    prompt: "How do I determine fair market value for a classic car I'm thinking of selling?",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  {
    label: "List a vehicle",
    prompt: "How do I list a vehicle for auction on Carasta? What does the seller process look like?",
    icon: <Car className="h-3.5 w-3.5" />,
  },
];

function pageContextFromPath(pathname: string): string {
  if (pathname === "/" || pathname === "") return "Carasta homepage (feed, live auctions, Carmunity)";
  if (pathname.startsWith("/auctions/") && pathname.length > 10)
    return "Auction detail page — user is viewing a specific auction listing";
  if (pathname === "/auctions") return "Auctions listing page — browsing all live auctions";
  if (pathname.startsWith("/u/")) return "User profile page";
  if (pathname.startsWith("/explore")) return "Carmunity social feed / explore page";
  if (pathname.startsWith("/discussions")) return "Carmunity Discussions / forums page";
  if (pathname.startsWith("/garage")) return "Garage page — user's car collection";
  if (pathname.startsWith("/sell") || pathname.startsWith("/list"))
    return "Listing / sell page — user is setting up a vehicle listing";
  if (pathname.startsWith("/messages")) return "Messages page — direct messaging";
  if (pathname.startsWith("/settings")) return "Account settings page";
  if (pathname.startsWith("/resources")) return "Resources / help page";
  if (pathname.startsWith("/contact")) return "Contact / support page";
  return `Carasta — ${pathname}`;
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bold: **text**
    const boldLine = line.replace(/\*\*(.+?)\*\*/g, (_, m) => `<b>${m}</b>`);

    if (line.startsWith("### ")) {
      elements.push(
        <p key={i} className="mt-2 text-xs font-bold uppercase tracking-wide text-primary">
          {line.slice(4)}
        </p>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <p key={i} className="mt-2 text-sm font-semibold text-foreground">
          {line.slice(3)}
        </p>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
        </div>
      );
    } else if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <code key={i} className="my-1 block rounded-lg border border-border bg-muted/60 px-3 py-2 font-mono text-xs text-foreground">
          {codeLines.join("\n")}
        </code>
      );
    } else if (line.trim() === "") {
      if (elements.length > 0) elements.push(<div key={`sp-${i}`} className="h-1" />);
    } else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed text-foreground/90"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }}
        />
      );
    }
    i++;
  }

  return elements;
}

export function CarastaAssistantChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [, startTransition] = useTransition();

  const pageContext = pageContextFromPath(pathname ?? "");

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, minimized]);

  useEffect(() => {
    if (!minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, minimized]);

  const sendMessage = useCallback(
    async (text: string) => {
      const prompt = text.trim();
      if (!prompt || streaming) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
      };

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setStreaming(true);
      setMinimized(false);

      const conversationHistory = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: prompt },
      ];

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversationHistory,
            pageContext,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error("Assistant request failed.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed?.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: m.content + delta }
                      : m
                  )
                );
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content:
                    "Sorry, something went wrong. Please try again.",
                  streaming: false,
                }
              : m
          )
        );
      } finally {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, streaming: false } : m
          )
        );
        setStreaming(false);
      }
    },
    [messages, streaming, pageContext]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
    setInput("");
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Floating launcher button */}
      <button
        type="button"
        aria-label="Open Carasta Assistant"
        onClick={() => {
          setOpen(true);
          setMinimized(false);
        }}
        className={cn(FLOATING_PILL_LAUNCHER_CLASS, open ? "hidden" : "")}
      >
        <Bot className="h-4 w-4 shrink-0 text-primary" />
        Carasta Assistant
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-4 right-4 z-[9999] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-e3 transition-all",
            minimized
              ? "h-[52px] w-[260px]"
              : "h-[600px] w-[380px] sm:w-[420px]"
          )}
          style={{ maxHeight: "calc(100vh - 32px)" }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-primary px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white leading-none">Carasta Assistant</p>
              <p className="mt-0.5 text-[10px] text-white/70">Cars + platform · powered by AI</p>
            </div>
            <div className="flex items-center gap-1">
              {!isEmpty && (
                <button
                  type="button"
                  onClick={clearChat}
                  aria-label="Clear chat"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/15 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setMinimized((v) => !v)}
                aria-label={minimized ? "Expand chat" : "Minimize chat"}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    minimized ? "rotate-180" : ""
                  )}
                />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {isEmpty ? (
                  <div className="flex flex-col items-center justify-center h-full text-center pb-4">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Bot className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Hi! I&apos;m your Carasta Assistant
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px] mb-5">
                      Ask me anything about cars — specs, repairs, buying advice — or how Carasta works.
                    </p>
                    <div className="w-full grid grid-cols-2 gap-2">
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => void sendMessage(p.prompt)}
                          className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-left text-xs font-medium text-foreground transition hover:border-primary/30 hover:bg-accent/40 hover:text-primary"
                        >
                          <span className="shrink-0 text-primary">{p.icon}</span>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2.5",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[82%] rounded-2xl px-3 py-2.5",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "border border-border bg-background rounded-tl-sm"
                          )}
                        >
                          {msg.role === "user" ? (
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          ) : msg.content ? (
                            <div className="space-y-1">
                              {renderMarkdown(msg.content)}
                            </div>
                          ) : msg.streaming ? (
                            <div className="flex items-center gap-1.5 py-0.5">
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                            </div>
                          ) : null}
                          {msg.streaming && msg.content && (
                            <span className="inline-block h-3.5 w-0.5 animate-pulse bg-primary ml-0.5 align-middle" />
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Page context indicator */}
              {pageContext && (
                <div className="shrink-0 border-t border-border/50 bg-muted/30 px-4 py-1.5">
                  <p className="text-[10px] text-muted-foreground truncate">
                    📍 {pageContext}
                  </p>
                </div>
              )}

              {/* Input area */}
              <div className="shrink-0 border-t border-border bg-card px-3 pb-3 pt-2">
                <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={streaming}
                    placeholder="Ask about cars or Carasta…"
                    data-skip-help-palette-shortcut="true"
                    className="flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
                    style={{ minHeight: "24px", maxHeight: "120px" }}
                  />
                  <button
                    type="button"
                    onClick={() => void sendMessage(input)}
                    disabled={!input.trim() || streaming}
                    aria-label="Send message"
                    className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-e1 transition hover:bg-[hsl(var(--primary-hover))] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {streaming ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                  Shift+Enter for new line · Enter to send
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
