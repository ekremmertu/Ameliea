/**
 * Romantic Theme Intro Animation
 * Floral Bloom animation
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';

interface RomanticIntroProps {
  onComplete: () => void;
  themeColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function RomanticIntro({ onComplete, themeColors }: RomanticIntroProps) {
  const [stage, setStage] = useState<'bloom' | 'fade' | 'complete'>('bloom');

  const primaryColor = themeColors?.primary || '#f3d7da';
  const secondaryColor = themeColors?.secondary || '#9caf88';

  useEffect(() => {
    const bloomTimer = setTimeout(() => setStage('fade'), 8000);
    const fadeTimer = setTimeout(() => setStage('complete'), 11000);
    const completeTimer = setTimeout(() => onComplete(), 12000);

    return () => {
      clearTimeout(bloomTimer);
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
          transition={{ duration: 1.5 }}
        >
          {/* Floral elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-6xl"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 20}%`,
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                🌸
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-4"
              style={{
                fontFamily: tokens.typography.fontFamily.brand.join(', '),
                color: 'white',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                fontSize: 'calc(1em + 4pt)',
              }}
            >
              Ameliea
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl italic"
              style={{
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: 'rgba(255, 255, 255, 0.95)',
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

