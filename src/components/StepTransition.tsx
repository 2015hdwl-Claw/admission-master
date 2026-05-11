'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface StepTransitionProps {
  children: React.ReactNode;
  stepKey: number;
  direction: 'forward' | 'backward';
}

export default function StepTransition({ children, stepKey, direction }: StepTransitionProps) {
  const slideFrom = direction === 'forward' ? 80 : -80;
  const slideTo = direction === 'forward' ? -80 : 80;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        initial={{ x: slideFrom, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: slideTo, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full flex-1 flex flex-col items-center justify-center px-4"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
