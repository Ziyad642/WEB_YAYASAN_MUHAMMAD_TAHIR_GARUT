'use client';

import { motion, MotionConfig, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode, useEffect, useState } from 'react';

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

interface RevealProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  y?: number;
}

/**
 * FadeInUp:
 * Uses initial={false} to ensure SSR and initial HTML is ALWAYS fully visible
 * (preventing blank flashes, SEO degradation, and headless screenshot opacity:0 issues).
 * On client hydration, smooth animations enhance the experience.
 */
export function FadeInUp({ children, delay = 0, y = 18, className, ...props }: RevealProps) {
  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function HeroEntrance({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
