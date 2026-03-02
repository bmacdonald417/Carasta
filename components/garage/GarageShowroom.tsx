"use client";

import { motion } from "framer-motion";

/**
 * Wrapper that adds a subtle 3D perspective / showroom feel to garage content.
 * Uses CSS 3D transforms for a virtual showroom effect.
 */
export function GarageShowroom({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="perspective-[1200px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="transform-gpu"
        style={{ transformStyle: "preserve-3d" }}
        whileHover={{ rotateY: 2, rotateX: -1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
