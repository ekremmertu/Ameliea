/**
 * Minimal Theme Intro Animation
 * Simple Fade animation
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';

interface MinimalIntroProps {
  onComplete: () => void;
  themeColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function MinimalIntro({ onComplete, themeColors }: MinimalIntroProps) {
  const [stage, setStage] = useState<'fade' | 'complete'>('fade');

  const primaryColor = themeColors?.primary || '#1b1620';
  const secondaryColor = themeColors?.secondary || '#fbf7ef';

  useEffect(() => {
    const fadeTimer = setTimeout(() => setStage('complete'), 5000);
    const completeTimer = setTimeout(() => onComplete(), 6000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'complete' && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: secondaryColor,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-light mb-4 tracking-wider"
              style={{
                fontFamily: tokens.typography.fontFamily.brand.join(', '),
                color: primaryColor,
                letterSpacing: '0.2em',
                fontSize: 'calc(1em + 4pt)',
              }}
            >
              Ameliea
            </motion.h1>
            <motion.p
              className="text-sm md:text-base font-light"
              style={{
                fontFamily: tokens.typography.fontFamily.sans.join(', '),
                color: primaryColor,
                opacity: 0.6,
                letterSpacing: '0.1em',
              }}
            >
              An invitation that feels like a vow
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

