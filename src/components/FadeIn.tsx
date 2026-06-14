"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
};

export default function FadeIn({
  children,
  delay = 0,
  y = 24,
}: FadeInProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: shouldReduce ? 0 : y,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        // amount: 0 means trigger as soon as ANY pixel enters the viewport,
        // which fixes the bug where sections already on screen never animate.
        amount: 0,
        margin: "0px 0px -60px 0px",
      }}
      transition={{
        duration: shouldReduce ? 0 : 0.7,
        delay: shouldReduce ? 0 : delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}