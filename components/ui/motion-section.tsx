"use client";

import { motion } from "framer-motion";

export function MotionSection({
  children,
  className,
  ...props
}: React.ComponentProps<typeof motion.section>) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}
