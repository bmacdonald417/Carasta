"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PinnedElement } from "./types";

function escapeCssIdent(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function buildSelectorPath(el: Element | null): string {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return "";
  const parts: string[] = [];
  let cur: Element | null = el;
  const root = document.body;
  let depth = 0;
  while (cur && cur !== root && depth < 12) {
    const tag = cur.tagName.toLowerCase();
    if (cur.id && String(cur.id).length > 0) {
      parts.unshift(`${tag}#${escapeCssIdent(cur.id)}`);
      break;
    }
    const parent: Element | null = cur.parentElement;
    if (!parent) {
      parts.unshift(tag);
      break;
    }
    const self = cur;
    const siblings = Array.from(parent.children).filter(
      (c): c is Element =>
        c instanceof Element && c.tagName === self.tagName
    );
    const idx = siblings.indexOf(cur) + 1;
    parts.unshift(`${tag}:nth-of-type(${idx})`);
    cur = parent;
    depth += 1;
  }
  return parts.join(" > ");
}

function elementSummary(el: Element): { text: string; type: string } {
  const type = el.tagName.toLowerCase();
  const text =
    (el as HTMLElement).innerText?.trim().slice(0, 280) ||
    el.textContent?.trim().slice(0, 280) ||
    "";
  return { text, type };
}

type Props = {
  active: boolean;
  onPick: (pinned: PinnedElement) => void;
  onCancel: () => void;
};

/**
 * Framework-agnostic hover + click pin. Keep this logic stable across kit updates.
 */
export function ElementSelector({ active, onPick, onCancel }: Props) {
  const [hovered, setHovered] = useState<Element | null>(null);
  const raf = useRef<number | null>(null);

  const highlight = useCallback((el: Element | null) => {
    document.querySelectorAll("[data-feedback-kit-hover]").forEach((n) => {
      (n as HTMLElement).removeAttribute("data-feedback-kit-hover");
      (n as HTMLElement).style.outline = "";
    });
    if (!el || !(el instanceof HTMLElement)) return;
    el.setAttribute("data-feedback-kit-hover", "1");
    el.style.outline = "2px solid hsl(var(--primary))";
    el.style.outlineOffset = "2px";
  }, []);

  useEffect(() => {
    if (!active) {
      highlight(null);
      setHovered(null);
      return;
    }

    const onMove = (e: MouseEvent) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const stack = document.elementsFromPoint(e.clientX, e.clientY);
        const pick = stack.find(
          (n) =>
            n instanceof HTMLElement &&
            !n.closest("[data-feedback-widget-root]") &&
            !n.closest("[data-feedback-selector-overlay]")
        );
        if (pick && pick !== hovered) {
          setHovered(pick);
          highlight(pick);
        }
      });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("keydown", onKey, true);
      if (raf.current) cancelAnimationFrame(raf.current);
      highlight(null);
    };
  }, [active, highlight, hovered, onCancel]);

  if (!active) return null;

  return (
    <div
      data-feedback-selector-overlay
      className="pointer-events-auto fixed inset-0 z-[90] cursor-crosshair"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const stack = document.elementsFromPoint(e.clientX, e.clientY);
        const el = stack.find(
          (n) =>
            n instanceof HTMLElement &&
            !n.closest("[data-feedback-widget-root]") &&
            !n.closest("[data-feedback-selector-overlay]")
        );
        if (!el) return;
        const selector = buildSelectorPath(el);
        const { text, type } = elementSummary(el);
        const idAttr =
          (el as HTMLElement).id && (el as HTMLElement).id.length > 0
            ? (el as HTMLElement).id
            : undefined;
        const classAttr =
          typeof (el as HTMLElement).className === "string"
            ? (el as HTMLElement).className
            : undefined;
        highlight(null);
        onPick({
          selector,
          text,
          type,
          idAttr,
          classAttr,
        });
      }}
    >
      <div className="pointer-events-none fixed left-1/2 top-4 z-[91] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/80 px-4 py-2 text-center text-sm text-neutral-200 shadow-lg backdrop-blur-md">
        Hover an element, then click to pin. Press Esc to cancel.
      </div>
    </div>
  );
}
