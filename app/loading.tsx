"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Geometric pulse loader */}
        <motion.div
          className="relative flex h-16 w-16 items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute h-full w-full rounded-lg border-2 border-[#ff3b5c]/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute h-3/4 w-3/4 rounded-lg border-2 border-[#ff3b5c]/50"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
          <motion.div
            className="absolute h-1/2 w-1/2 rounded-lg border-2 border-[#ff3b5c]"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
        </motion.div>
        {/* Shimmer text */}
        <motion.p
          className="text-sm font-medium uppercase tracking-widest text-neutral-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Loading
        </motion.p>
      </div>
    </div>
  );
}
