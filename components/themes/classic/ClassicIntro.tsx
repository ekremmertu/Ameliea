/**
 * Classic Theme Intro Animation
 * Vintage Scroll animation
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';

interface ClassicIntroProps {
  onComplete: () => void;
  themeColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function ClassicIntro({ onComplete, themeColors }: ClassicIntroProps) {
  const [stage, setStage] = useState<'scroll' | 'fade' | 'complete'>('scroll');

  const primaryColor = themeColors?.primary || '#fbf7ef';
  const secondaryColor = themeColors?.secondary || '#c8a24a';

  useEffect(() => {
    const scrollTimer = setTimeout(() => setStage('fade'), 8000);
    const fadeTimer = setTimeout(() => setStage('complete'), 9500);
    const completeTimer = setTimeout(() => onComplete(), 10000);

    return () => {
      clearTimeout(scrollTimer);
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
            background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="relative"
            style={{
              width: '90%',
              maxWidth: '500px',
            }}
            initial={{ scaleY: 0, transformOrigin: 'top' }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="p-12 rounded-lg border-4"
              style={{
                backgroundColor: primaryColor,
                borderColor: secondaryColor,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-4 text-center"
                style={{
                  fontFamily: tokens.typography.fontFamily.brand.join(', '),
                  color: secondaryColor,
                  fontSize: 'calc(1em + 4pt)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
              >
                Ameliea
              </motion.h1>
              <motion.p
                className="text-center italic"
                style={{
                  fontFamily: tokens.typography.fontFamily.serif.join(', '),
                  color: secondaryColor,
                  opacity: 0.8,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
              >
                An invitation that feels like a vow
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

