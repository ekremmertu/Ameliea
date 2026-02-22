'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InvitationData {
  coupleName: string;
  groomName: string;
  brideName: string;
  personalMessage?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

interface InvitationIntroProps {
  invitationData: InvitationData;
  onComplete: () => void;
}

export function InvitationIntro({ invitationData, onComplete }: InvitationIntroProps) {
  const [stage, setStage] = useState<'envelope' | 'seal' | 'message' | 'fade'>('envelope');
  const [sealOpen, setSealOpen] = useState(false);

  useEffect(() => {
    // Stage 1: Envelope appears (0.5s)
    const envelopeTimer = setTimeout(() => {
      setStage('seal');
    }, 500);

    // Stage 2: Seal opens (1.5s)
    const sealTimer = setTimeout(() => {
      setSealOpen(true);
      setTimeout(() => setStage('message'), 1000);
    }, 2000);

    // Stage 3: Message appears (2s)
    const messageTimer = setTimeout(() => {
      setStage('fade');
    }, 5000);

    // Stage 4: Fade out and show invitation (1s)
    const fadeTimer = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(envelopeTimer);
      clearTimeout(sealTimer);
      clearTimeout(messageTimer);
      clearTimeout(fadeTimer);
    };
  }, [onComplete]);

  // Extract initials from names
  const getInitials = () => {
    const brideInitial = invitationData.brideName.charAt(0).toUpperCase();
    const groomInitial = invitationData.groomName.charAt(0).toUpperCase();
    return { brideInitial, groomInitial };
  };

  const { brideInitial, groomInitial } = getInitials();

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
          <div className="relative w-full max-w-[600px] px-4" style={{ perspective: '1200px' }}>
            <motion.div
              className="relative w-full"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Envelope */}
              <div 
                className="relative w-full mx-auto"
                style={{ 
                  aspectRatio: '3/4', 
                  maxWidth: '500px', 
                  maxHeight: '667px',
                }}
              >
                {/* Envelope background */}
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, var(--ivory-light), var(--ivory-base))',
                    boxShadow: '0 30px 80px rgba(27, 22, 32, 0.2)',
                  }}
                >
                  {/* Envelope flaps */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1/3"
                    style={{
                      background: 'linear-gradient(135deg, var(--ivory-dark), var(--ivory-base))',
                      clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
                      opacity: 0.6,
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1/4"
                    style={{
                      background: 'linear-gradient(135deg, var(--ivory-base), var(--ivory-dark))',
                      clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0 100%)',
                      opacity: 0.4,
                    }}
                  />
                </div>

                {/* Wax Seal */}
                <motion.div
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'clamp(80px, 20vw, 120px)',
                    height: 'clamp(80px, 20vw, 120px)',
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: sealOpen ? 1.2 : 1, 
                    opacity: 1,
                    rotate: sealOpen ? 180 : 0,
                  }}
                  transition={{ 
                    duration: 1.5, 
                    ease: [0.34, 1.56, 0.64, 1] 
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${invitationData.theme.primaryColor}, ${invitationData.theme.secondaryColor})`,
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />
                  {/* Monogram */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      fontFamily: 'ui-serif, Georgia, serif',
                      fontSize: 'clamp(24px, 6vw, 36px)',
                      fontWeight: 700,
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 1.5,
                      ease: [0.34, 1.56, 0.64, 1] 
                    }}
                  >
                    {brideInitial} & {groomInitial}
                  </motion.div>
                </motion.div>

                {/* Personal Message */}
                <AnimatePresence>
                  {stage === 'message' && (
                    <motion.div
                      className="absolute"
                      style={{
                        bottom: '15%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        textAlign: 'center',
                      }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p
                        className="text-sm md:text-base lg:text-lg italic"
                        style={{
                          fontFamily: 'ui-serif, Georgia, serif',
                          color: 'var(--text-secondary)',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {invitationData.personalMessage || 'Bu davetiye sadece senin için'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

