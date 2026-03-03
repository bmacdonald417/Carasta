"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const STAGGER_DELAY = 0.08;
const DURATION = 0.5;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_DELAY,
      delayChildren: i * 0.1,
    },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: "easeOut" as const },
  },
};

const SECTIONS = [
  {
    id: "discover",
    title: "Discover",
    description:
      "Browse curated collector cars from trusted sellers. Filter by make, model, year, and condition. Each listing includes detailed condition reports, high-resolution photos, and transparent seller profiles.",
  },
  {
    id: "bid",
    title: "Bid with Confidence",
    description:
      "Place bids in real time with our anti-sniping system. Set auto-bids to stay in the race without constant monitoring. The reserve meter shows how close the high bid is to meeting the seller's reserve—no surprises.",
  },
  {
    id: "reserve",
    title: "Reserve & Anti-Sniping Explained",
    description:
      "Sellers can set a hidden reserve. Bidders see a reserve meter that fills as bids approach it. When the auction closes in the final minutes, our anti-sniping extends the clock if a new bid arrives—giving everyone a fair chance.",
  },
  {
    id: "checkout",
    title: "Secure Checkout",
    description:
      "Once you win, complete payment securely through our platform. Funds are held in escrow until delivery is confirmed. All transactions are protected and documented.",
  },
  {
    id: "delivery",
    title: "Delivery & Documentation",
    description:
      "Coordinate pickup or shipping with the seller. Receive title, bill of sale, and condition documentation. We support the full handoff so you drive away with confidence.",
  },
];

export function HowItWorksTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="relative">
      {/* Vertical timeline line */}
      <div
        className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-[#ff3b5c]/60 via-[#ff3b5c]/30 to-transparent md:left-[23px]"
        aria-hidden
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="space-y-12"
      >
        {SECTIONS.map((section, i) => (
          <motion.div
            key={section.id}
            id={section.id}
            variants={itemVariants}
            className="relative flex gap-6 md:gap-8 scroll-mt-24"
          >
            {/* Timeline dot */}
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#ff3b5c]/60 bg-black/60 shadow-[0_0_12px_rgba(255,59,92,0.3)] md:h-12 md:w-12">
              <span className="text-xs font-bold text-[#ff3b5c] md:text-sm">
                {i + 1}
              </span>
            </div>

            {/* Glass panel with neon accent */}
            <div className="group relative flex-1 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_0_20px_rgba(255,59,92,0.04)] backdrop-blur-xl transition-all hover:border-[#ff3b5c]/20 hover:shadow-[0_0_0_1px_rgba(255,59,92,0.2),0_0_24px_rgba(255,59,92,0.08)]">
              <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-gradient-to-b from-transparent via-[#ff3b5c]/50 to-transparent" />
              <h3 className="font-display text-lg font-semibold text-neutral-100 md:text-xl">
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400 md:text-base">
                {section.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
