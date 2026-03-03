/**
 * Shared Framer Motion variants for consistent animations across the app.
 */

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Stagger children with delay based on index */
export const staggerChild = (i: number, baseDelay = 0.05, duration = 0.4) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: i * baseDelay, duration },
  },
});

/** Card/list item variants for staggered reveal */
export const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const hoverLift = {
  y: -4,
  scale: 1.02,
  transition: { duration: 0.2 },
};
