"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { HowItWorksStep } from "./HowItWorksStep";
import { HOW_IT_WORKS_SECTIONS } from "./how-it-works-sections";

export function HowItWorksTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative">
      {/* Vertical timeline line */}
      <div
        className="absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-[#ff3b5c]/50 via-[#ff3b5c]/25 to-transparent md:left-6"
        aria-hidden
      />

      <div className="space-y-10 md:space-y-12">
        {HOW_IT_WORKS_SECTIONS.map((section, i) => (
          <HowItWorksStep
            key={section.id}
            id={section.id}
            icon={section.icon}
            title={section.title}
            description={section.description}
            index={i}
            isInView={isInView}
          />
        ))}
      </div>
    </div>
  );
}
