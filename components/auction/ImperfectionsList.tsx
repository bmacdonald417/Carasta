"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export type ImperfectionItem = {
  location: string;
  description: string;
  severity: "minor" | "moderate" | "major";
};

/** Legacy format: plain string. New format: { location, description, severity } */
export type ImperfectionInput = ImperfectionItem | string;

function normalizeImperfections(
  raw: unknown
): ImperfectionItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map((item): ImperfectionItem | null => {
      if (typeof item === "string") {
        return { location: "", description: item, severity: "minor" as const };
      }
      if (
        item &&
        typeof item === "object" &&
        "description" in item &&
        typeof (item as ImperfectionItem).description === "string"
      ) {
        const o = item as ImperfectionItem;
        return {
          location: typeof o.location === "string" ? o.location : "",
          description: o.description,
          severity:
            o.severity === "minor" || o.severity === "moderate" || o.severity === "major"
              ? o.severity
              : "minor",
        };
      }
      return null;
    })
    .filter((x): x is ImperfectionItem => x != null);
}

const SEVERITY_STYLES = {
  minor: {
    border: "border-l-emerald-500/70",
    text: "text-emerald-400/90",
    badge: "bg-emerald-500/20 text-emerald-400",
  },
  moderate: {
    border: "border-l-amber-500/70",
    text: "text-amber-400/90",
    badge: "bg-amber-500/20 text-amber-400",
  },
  major: {
    border: "border-l-red-500/70",
    text: "text-red-400/90",
    badge: "bg-red-500/20 text-red-400",
  },
} as const;

export function ImperfectionsList({ imperfections }: { imperfections: unknown }) {
  const [expanded, setExpanded] = useState(true);
  const items = normalizeImperfections(imperfections);

  if (items.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Imperfections ({items.length})</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            {items.map((item, i) => {
              const style = SEVERITY_STYLES[item.severity];
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className={`rounded-r-lg border-l-2 bg-white/5 py-2 pl-3 pr-3 text-sm ${style.border} ${style.text}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium uppercase ${style.badge}`}
                    >
                      {item.severity}
                    </span>
                    {item.location && (
                      <span className="font-medium">{item.location}:</span>
                    )}
                  </div>
                  <p className="mt-0.5">{item.description}</p>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
