"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  gap = 0.08,
}: {
  children: ReactNode[];
  className?: string;
  gap?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * gap}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
