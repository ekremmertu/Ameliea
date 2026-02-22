/**
 * Modern Theme Intro Animation
 * Fade & Zoom animation
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';

interface ModernIntroProps {
  onComplete: () => void;
  themeColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function ModernIntro({ onComplete, themeColors }: ModernIntroProps) {
  const [stage, setStage] = useState<'fade' | 'zoom' | 'complete'>('fade');

  const primaryColor = themeColors?.primary || '#1b1620';
  const secondaryColor = themeColors?.secondary || '#e8c4c8';

  useEffect(() => {
    const fadeTimer = setTimeout(() => setStage('zoom'), 2000);
    const zoomTimer = setTimeout(() => setStage('complete'), 6000);
    const completeTimer = setTimeout(() => onComplete(), 8000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(zoomTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'complete' && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: stage === 'zoom' ? 1.1 : 1,
              opacity: 1,
            }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-4"
              style={{
                fontFamily: tokens.typography.fontFamily.brand.join(', '),
                color: 'white',
                letterSpacing: '0.1em',
                fontSize: 'calc(1em + 4pt)',
              }}
            >
              Ameliea
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl"
              style={{
                fontFamily: tokens.typography.fontFamily.sans.join(', '),
                color: 'rgba(255, 255, 255, 0.9)',
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

