"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Révélation au scroll — utilisée avec parcimonie (sections clés), pas sur chaque carte. */
export function Reveal({ children, delay = 0, y = 28, className, once = true }: { children: ReactNode; delay?: number; y?: number; className?: string; once?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Image qui se dévoile par un masque (clip-path), effet « rideau ». */
export function RevealMask({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
}
