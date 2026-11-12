"use client";

import { motion, useReducedMotion } from "motion/react";
import { Children } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Slow settle of the hero photograph. Scale only, so the image is never hidden (keeps LCP intact). */
export function ImageSettle({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ scale: 1.07 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease }}>
      {children}
    </motion.div>
  );
}

/** Children rise in one after another on load. */
export function Stagger({ children, className, delay = 0.15 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div className={className}>
      {Children.toArray(children).map((child, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: delay + i * 0.09, ease }}>
          {child}
        </motion.div>
      ))}
    </div>
  );
}
