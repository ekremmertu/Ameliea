/**
 * Elegant Theme Intro Animation
 * Door opening animation (existing animation)
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';

interface ElegantIntroProps {
  onComplete: () => void;
  themeColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function ElegantIntro({ onComplete, themeColors }: ElegantIntroProps) {
  const [stage, setStage] = useState<'door' | 'couple' | 'fade'>('door');
  const [doorOpen, setDoorOpen] = useState(false);

  const primaryColor = themeColors?.primary || '#c8a24a';
  const secondaryColor = themeColors?.secondary || '#a12b3a';

  useEffect(() => {
    // Stage 1: Kapı açılma
    const doorTimer = setTimeout(() => {
      setDoorOpen(true);
      setTimeout(() => setStage('couple'), 1000);
    }, 500);

    // Stage 2: Çift görünür
    const coupleTimer = setTimeout(() => {
      setStage('fade');
    }, 5500);

    // Stage 3: Fade out ve siteye geçiş
    const fadeTimer = setTimeout(() => {
      onComplete();
    }, 10000);

    return () => {
      clearTimeout(doorTimer);
      clearTimeout(coupleTimer);
      clearTimeout(fadeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'fade' && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, var(--bg-primary), var(--bg-secondary))',
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Köşk Kapısı - RESPONSIVE */}
          <div className="relative w-full max-w-[600px] px-4" style={{ perspective: '1200px' }}>
            {/* Kapı Çerçevesi */}
            <motion.div
              className="relative w-full"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Kapı Çerçevesi (Köşk stili) - RESPONSIVE */}
              <div className="relative w-full" style={{ aspectRatio: '3/4', maxWidth: '600px', maxHeight: '800px', margin: '0 auto' }}>
                {/* Arka plan (duvar) */}
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(180deg, var(--ivory-dark), var(--ivory-base))',
                    opacity: 0.4,
                  }}
                />

                {/* Kapı çerçevesi (ahşap) - RESPONSIVE */}
                <div
                  className="absolute"
                  style={{
                    left: '12.5%',
                    top: '18.75%',
                    width: '75%',
                    height: '75%',
                    border: 'clamp(6px, 2vw, 12px) solid',
                    borderColor: primaryColor,
                    borderRadius: 'clamp(4px, 1.5vw, 6px)',
                    boxShadow: '0 30px 80px rgba(27, 22, 32, 0.4)',
                  }}
                />

                {/* Üst süsleme (köşk detayı) - RESPONSIVE */}
                <svg
                  className="absolute"
                  style={{ left: '12.5%', top: '18.75%', width: '75%', height: '8.75%' }}
                  viewBox="0 0 450 70"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 70 Q 225 15, 450 70"
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Sol kapı */}
                <motion.div
                  className="absolute"
                  style={{
                    left: '12.5%',
                    top: '18.75%',
                    width: '37.5%',
                    height: '75%',
                    background: 'var(--ink-base)',
                    borderRadius: 'clamp(4px, 1.5vw, 6px)',
                    transformOrigin: 'left center',
                    boxShadow: doorOpen ? '0 15px 50px rgba(27, 22, 32, 0.5)' : 'none',
                  }}
                  initial={{ rotateY: 0, x: 0 }}
                  animate={{
                    rotateY: doorOpen ? -85 : 0,
                    x: doorOpen ? -30 : 0,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <div
                    className="absolute"
                    style={{
                      left: 'clamp(8px, 2.5vw, 15px)',
                      top: '50%',
                      width: 'clamp(6px, 2vw, 12px)',
                      height: 'clamp(40px, 10vh, 80px)',
                      background: primaryColor,
                      borderRadius: 'clamp(3px, 1vw, 6px)',
                      opacity: doorOpen ? 0 : 1,
                      transition: 'opacity 0.3s',
                    }}
                  />
                </motion.div>

                {/* Sağ kapı */}
                <motion.div
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '18.75%',
                    width: '37.5%',
                    height: '75%',
                    background: 'var(--ink-base)',
                    borderRadius: 'clamp(4px, 1.5vw, 6px)',
                    transformOrigin: 'right center',
                    boxShadow: doorOpen ? '0 15px 50px rgba(27, 22, 32, 0.5)' : 'none',
                  }}
                  initial={{ rotateY: 0, x: 0 }}
                  animate={{
                    rotateY: doorOpen ? 85 : 0,
                    x: doorOpen ? 30 : 0,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.1,
                  }}
                >
                  <div
                    className="absolute"
                    style={{
                      right: 'clamp(8px, 2.5vw, 15px)',
                      top: '50%',
                      width: 'clamp(6px, 2vw, 12px)',
                      height: 'clamp(40px, 10vh, 80px)',
                      background: primaryColor,
                      borderRadius: 'clamp(3px, 1vw, 6px)',
                      opacity: doorOpen ? 0 : 1,
                      transition: 'opacity 0.3s',
                    }}
                  />
                </motion.div>
              </div>

              {/* Gelin-Damat Silüeti */}
              <AnimatePresence>
                {stage === 'couple' && (
                  <motion.div
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '70%',
                      height: '71.25%',
                      maxWidth: '420px',
                      maxHeight: '570px',
                    }}
                    initial={{ opacity: 0, y: 60, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.9 }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 420 570"
                      preserveAspectRatio="xMidYMid meet"
                      style={{ filter: 'drop-shadow(0 30px 60px rgba(27, 22, 32, 0.4))' }}
                    >
                      {/* Gelin (sol) */}
                      <motion.g
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <path
                          d="M 90 540 L 110 330 Q 110 270, 135 255 Q 160 240, 165 285 L 165 540 Z"
                          fill={secondaryColor}
                          opacity="0.9"
                        />
                        <ellipse
                          cx="127"
                          cy="285"
                          rx="33"
                          ry="42"
                          fill="var(--ivory-base)"
                        />
                        <circle cx="118" cy="280" r="4" fill="var(--ink-base)" />
                        <circle cx="136" cy="280" r="4" fill="var(--ink-base)" />
                        <path
                          d="M 118 295 Q 127 300, 136 295"
                          fill="none"
                          stroke={secondaryColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 94 285 Q 127 250, 160 285 Q 127 260, 94 285"
                          fill="var(--ink-base)"
                          opacity="0.8"
                        />
                      </motion.g>

                      {/* Damat (sağ) */}
                      <motion.g
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <path
                          d="M 255 540 L 275 330 Q 275 270, 300 255 Q 325 240, 330 285 L 330 540 Z"
                          fill="var(--ink-base)"
                          opacity="0.9"
                        />
                        <ellipse
                          cx="302"
                          cy="285"
                          rx="33"
                          ry="42"
                          fill="var(--ivory-base)"
                        />
                        <circle cx="293" cy="280" r="4" fill="var(--ink-base)" />
                        <circle cx="311" cy="280" r="4" fill="var(--ink-base)" />
                        <path
                          d="M 293 295 Q 302 300, 311 295"
                          fill="none"
                          stroke={secondaryColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <rect
                          x="265"
                          y="255"
                          width="60"
                          height="42"
                          rx="8"
                          fill="var(--ink-base)"
                          opacity="0.8"
                        />
                      </motion.g>

                      {/* Eller birleşmiş */}
                      <motion.circle
                        cx="210"
                        cy="375"
                        r="12"
                        fill="var(--ivory-base)"
                        opacity="0.95"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.95 }}
                        transition={{
                          duration: 0.8,
                          delay: 1.4,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Başlık Yazısı */}
              {doorOpen && (
                <motion.div
                  className="absolute"
                  style={{
                    left: '50%',
                    textAlign: 'center',
                    width: '90%',
                    maxWidth: '600px',
                    zIndex: 10,
                  }}
                  initial={{
                    bottom: 'calc(18.75% + 30%)',
                    transform: 'translateX(-50%)',
                    opacity: 0,
                  }}
                  animate={{
                    bottom: 'calc(18.75% + 75% + 5px)',
                    transform: 'translateX(-50%)',
                    opacity: 1,
                  }}
                  transition={{
                    duration: 2.8,
                    delay: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <motion.p
                    className="text-2xl md:text-3xl lg:text-4xl xl:text-6xl"
                    style={{
                      fontFamily: tokens.typography.fontFamily.brand.join(', '),
                      color: tokens.colors.text.primary,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      marginBottom: '12px',
                      fontSize: 'calc(1em + 4pt)',
                      textShadow: '0 4px 20px rgba(27, 22, 32, 0.3)',
                    }}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    transition={{
                      duration: 2.8,
                      delay: 0.3,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                  >
                    Ameliea
                  </motion.p>
                  <motion.p
                    className="text-xs md:text-sm lg:text-base xl:text-xl"
                    style={{
                      fontFamily: tokens.typography.fontFamily.serif.join(', '),
                      color: tokens.colors.text.secondary,
                      fontStyle: 'italic',
                      textShadow: '0 2px 10px rgba(27, 22, 32, 0.2)',
                    }}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 2.5,
                      delay: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    An invitation that feels like a vow
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

