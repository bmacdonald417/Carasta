"use client";

import type { ReactNode } from "react";

import { AuthorHandleLink } from "@/components/discussions/AuthorHandleLink";
import { MENTION_HANDLE_REGEX } from "@/lib/discussions/mentions";
import { cn } from "@/lib/utils";

export function DiscussionRichText({
  text,
  validHandles,
  className,
}: {
  text: string;
  /** Lowercase handles that exist in Carmunity (others render as plain text). */
  validHandles: string[];
  className?: string;
}) {
  const valid = new Set(validHandles.map((h) => h.toLowerCase()));
  const nodes: ReactNode[] = [];
  const re = new RegExp(MENTION_HANDLE_REGEX.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(
        <span key={`t-${key++}`} className="whitespace-pre-wrap">
          {text.slice(last, m.index)}
        </span>
      );
    }
    const rawHandle = m[1];
    const token = m[0];
    if (rawHandle && valid.has(rawHandle.toLowerCase())) {
      nodes.push(
        <AuthorHandleLink
          key={`m-${key++}`}
          handle={rawHandle}
          className={cn("text-primary underline-offset-4 hover:underline", className)}
        />
      );
    } else {
      nodes.push(
        <span key={`p-${key++}`} className="whitespace-pre-wrap">
          {token}
        </span>
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) {
    nodes.push(
      <span key={`t-${key++}`} className="whitespace-pre-wrap">
        {text.slice(last)}
      </span>
    );
  }

  return <span className={cn("inline leading-relaxed", className)}>{nodes}</span>;
}
