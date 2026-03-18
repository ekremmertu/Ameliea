'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [stage, setStage] = useState<'door' | 'couple' | 'fade'>('door');
  const [doorOpen, setDoorOpen] = useState(false);

  useEffect(() => {
    // Stage 1: Kapı açılma (eski zamanlama - 500ms)
    const doorTimer = setTimeout(() => {
      setDoorOpen(true);
      setTimeout(() => setStage('couple'), 1000);
    }, 500); // Eski zamanlamaya geri döndük

    // Stage 2: Çift görünür (4.5s - daha uzun süre gösterilsin)
    const coupleTimer = setTimeout(() => {
      setStage('fade');
    }, 5500); // Eski zamanlamaya geri döndük

    // Stage 3: Fade out ve siteye geçiş (1.5s) - Toplam 10s
    const fadeTimer = setTimeout(() => {
      onComplete();
    }, 10000); // Eski zamanlamaya geri döndük

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
                    border: 'clamp(6px, 2vw, 12px) solid var(--gold-base)',
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
                    stroke="var(--gold-base)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Sol kapı - RESPONSIVE */}
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
                  {/* Kapı detayları */}
                  <div
                    className="absolute"
                    style={{
                      left: 'clamp(8px, 2.5vw, 15px)',
                      top: '50%',
                      width: 'clamp(6px, 2vw, 12px)',
                      height: 'clamp(40px, 10vh, 80px)',
                      background: 'var(--gold-base)',
                      borderRadius: 'clamp(3px, 1vw, 6px)',
                      opacity: doorOpen ? 0 : 1,
                      transition: 'opacity 0.3s',
                    }}
                  />
                </motion.div>

                {/* Sağ kapı - RESPONSIVE */}
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
                  {/* Kapı detayları */}
                  <div
                    className="absolute"
                    style={{
                      right: 'clamp(8px, 2.5vw, 15px)',
                      top: '50%',
                      width: 'clamp(6px, 2vw, 12px)',
                      height: 'clamp(40px, 10vh, 80px)',
                      background: 'var(--gold-base)',
                      borderRadius: 'clamp(3px, 1vw, 6px)',
                      opacity: doorOpen ? 0 : 1,
                      transition: 'opacity 0.3s',
                    }}
                  />
                </motion.div>
              </div>

              {/* Gelin-Damat Silüeti (kapı açıldıktan sonra) - RESPONSIVE */}
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
                      {/* Gelin (sol) - ÇOK DAHA DETAYLI VE NET */}
                      <motion.g
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {/* Gelin elbisesi (çok daha zarif, detaylı) */}
                        <path
                          d="M 90 540 L 110 330 Q 110 270, 135 255 Q 160 240, 165 285 L 165 540 Z"
                          fill="var(--crimson-base)"
                          opacity="0.9"
                        />
                        {/* Gelin elbisesi detay (korsaj) */}
                        <path
                          d="M 110 330 Q 127 300, 140 285 Q 153 270, 165 285"
                          fill="none"
                          stroke="var(--gold-base)"
                          strokeWidth="3"
                          opacity="0.5"
                        />
                        {/* Gelin başı (yüz) - DAHA BÜYÜK */}
                        <ellipse
                          cx="127"
                          cy="285"
                          rx="33"
                          ry="42"
                          fill="var(--ivory-base)"
                        />
                        {/* Gelin gözleri */}
                        <circle cx="118" cy="280" r="4" fill="var(--ink-base)" />
                        <circle cx="136" cy="280" r="4" fill="var(--ink-base)" />
                        {/* Gelin gülümsemesi */}
                        <path
                          d="M 118 295 Q 127 300, 136 295"
                          fill="none"
                          stroke="var(--crimson-base)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        {/* Gelin saçı - uzun sarı, aşağı dökülen kitle */}
                        <path
                          d="M 96 265 Q 84 305, 80 365 Q 76 425, 78 492 L 92 492 Q 89 428, 92 370 Q 96 310, 105 272 Z"
                          fill="#C8963E"
                          opacity="0.92"
                        />
                        {/* Sağ taraf uzun saç */}
                        <path
                          d="M 155 268 Q 164 298, 166 345 L 158 345 Q 157 300, 150 273 Z"
                          fill="#C8963E"
                          opacity="0.85"
                        />
                        {/* Üst saç - kafa üstü */}
                        <path
                          d="M 100 252 Q 127 241, 155 252 Q 162 262, 157 271 Q 127 261, 97 271 Q 93 262, 100 252 Z"
                          fill="#D4A843"
                          opacity="0.95"
                        />
                        {/* Saç parıltısı */}
                        <path
                          d="M 109 250 Q 127 244, 148 250"
                          fill="none"
                          stroke="#F0D060"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          opacity="0.65"
                        />
                        {/* Rüzgarda savrulan saç teli 1 */}
                        <motion.path
                          d="M 96 267 Q 68 254, 40 258 Q 22 261, 8 255"
                          fill="none"
                          stroke="#E8C547"
                          strokeWidth="3"
                          strokeLinecap="round"
                          opacity="0.9"
                          animate={{
                            d: [
                              "M 96 267 Q 68 254, 40 258 Q 22 261, 8 255",
                              "M 96 267 Q 66 249, 38 253 Q 20 257, 6 250",
                              "M 96 267 Q 68 254, 40 258 Q 22 261, 8 255",
                            ],
                          }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {/* Rüzgarda savrulan saç teli 2 */}
                        <motion.path
                          d="M 95 278 Q 65 265, 37 269 Q 19 273, 5 267"
                          fill="none"
                          stroke="#D4A843"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          opacity="0.8"
                          animate={{
                            d: [
                              "M 95 278 Q 65 265, 37 269 Q 19 273, 5 267",
                              "M 95 278 Q 62 260, 34 265 Q 16 268, 2 262",
                              "M 95 278 Q 65 265, 37 269 Q 19 273, 5 267",
                            ],
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
                        />
                        {/* Rüzgarda savrulan saç teli 3 */}
                        <motion.path
                          d="M 93 291 Q 63 280, 35 284 Q 17 287, 4 281"
                          fill="none"
                          stroke="#C8963E"
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity="0.7"
                          animate={{
                            d: [
                              "M 93 291 Q 63 280, 35 284 Q 17 287, 4 281",
                              "M 93 291 Q 60 275, 32 279 Q 14 283, 1 276",
                              "M 93 291 Q 63 280, 35 284 Q 17 287, 4 281",
                            ],
                          }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                        />
                        {/* Gelin tülü (daha belirgin) */}
                        <path
                          d="M 90 330 Q 127 300, 165 330"
                          fill="none"
                          stroke="var(--ivory-base)"
                          strokeWidth="3"
                          opacity="0.6"
                          strokeDasharray="6,6"
                        />
                        {/* Gelin tülü detay */}
                        <path
                          d="M 95 320 Q 127 295, 160 320"
                          fill="none"
                          stroke="var(--ivory-base)"
                          strokeWidth="2"
                          opacity="0.4"
                          strokeDasharray="4,4"
                        />
                        {/* Gelin buketi (detay) */}
                        <circle
                          cx="100"
                          cy="400"
                          r="25"
                          fill="var(--gold-base)"
                          opacity="0.3"
                        />
                        <path
                          d="M 100 400 Q 95 420, 100 440"
                          fill="none"
                          stroke="var(--gold-base)"
                          strokeWidth="3"
                          opacity="0.5"
                        />
                      </motion.g>

                      {/* Damat (sağ) - ÇOK DAHA DETAYLI VE NET */}
                      <motion.g
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {/* Damat ceketi - DAHA DETAYLI */}
                        <path
                          d="M 255 540 L 275 330 Q 275 270, 300 255 Q 325 240, 330 285 L 330 540 Z"
                          fill="var(--ink-base)"
                          opacity="0.9"
                        />
                        {/* Damat ceket yakası */}
                        <path
                          d="M 275 330 L 280 300 L 300 295 L 330 300 L 330 330"
                          fill="var(--ink-base)"
                          opacity="0.95"
                        />
                        {/* Damat başı - DAHA BÜYÜK */}
                        <ellipse
                          cx="302"
                          cy="285"
                          rx="33"
                          ry="42"
                          fill="var(--ivory-base)"
                        />
                        {/* Damat gözleri */}
                        <circle cx="293" cy="280" r="4" fill="var(--ink-base)" />
                        <circle cx="311" cy="280" r="4" fill="var(--ink-base)" />
                        {/* Damat gülümsemesi */}
                        <path
                          d="M 293 295 Q 302 300, 311 295"
                          fill="none"
                          stroke="var(--crimson-base)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        {/* Damat saçı - DAHA DETAYLI */}
                        <rect
                          x="265"
                          y="255"
                          width="60"
                          height="42"
                          rx="8"
                          fill="var(--ink-base)"
                          opacity="0.8"
                        />
                        {/* Damat saç detayları */}
                        <path
                          d="M 270 260 L 290 265 L 310 260"
                          fill="none"
                          stroke="var(--gold-base)"
                          strokeWidth="2"
                          opacity="0.3"
                        />
                        {/* Damat kravat (çok daha belirgin) */}
                        <rect
                          x="295"
                          y="330"
                          width="15"
                          height="120"
                          rx="3"
                          fill="var(--crimson-base)"
                          opacity="0.7"
                        />
                        {/* Damat kravat düğümü */}
                        <path
                          d="M 295 330 Q 302 340, 310 330"
                          fill="var(--crimson-base)"
                          opacity="0.8"
                        />
                        {/* Damat gömlek yakası */}
                        <path
                          d="M 280 330 L 285 350 L 300 355 L 315 350 L 320 330"
                          fill="var(--ivory-base)"
                          opacity="0.9"
                        />
                      </motion.g>

                      {/* Eller birleşmiş (romantik dokunuş) - DAHA BÜYÜK */}
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
                      {/* Eller detay */}
                      <motion.path
                        d="M 195 375 Q 210 365, 225 375"
                        fill="none"
                        stroke="var(--gold-base)"
                        strokeWidth="2"
                        opacity="0.6"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{
                          duration: 0.6,
                          delay: 1.6,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />

                      {/* Kalp (üstte, romantik dokunuş) - DAHA BÜYÜK */}
                      <motion.path
                        d="M 210 195 Q 180 165, 210 135 Q 240 165, 210 195"
                        fill="var(--crimson-base)"
                        opacity="0.8"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.8] }}
                        transition={{
                          duration: 1.2,
                          delay: 1.7,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                      />
                      {/* Kalp detay (parıltı) */}
                      <motion.circle
                        cx="210"
                        cy="165"
                        r="8"
                        fill="var(--gold-base)"
                        opacity="0.6"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 1] }}
                        transition={{
                          duration: 0.8,
                          delay: 2,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Başlık Yazısı - Sadece kapı açılınca görünür */}
              {doorOpen && (
                <motion.div
                  className="absolute"
                  style={{
                    left: '50%',
                    textAlign: 'center',
                    width: '90%',
                    maxWidth: '600px',
                    zIndex: 10, // Kapı kapaklarının üstünde
                  }}
                  initial={{
                    bottom: 'calc(18.75% + 30%)', // Kapının içinde başla
                    transform: 'translateX(-50%)',
                    opacity: 0,
                    scale: 0.4,
                  }}
                  animate={{
                    bottom: 'calc(18.75% + 75% + 5px)', // Kapının üstüne çık (15px'den 5px'e düşürdük - daha yakın)
                    transform: 'translateX(-50%)',
                    opacity: 1,
                    scale: 1.2,
                  }}
                  transition={{
                    duration: 2.8, // Yavaş yukarı çıkma
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
                      marginTop: '4em',
                      marginBottom: '12px',
                      fontSize: 'calc(1em + 4pt)',
                      textShadow: '0 4px 20px rgba(27, 22, 32, 0.3)',
                    }}
                    initial={{ 
                      scale: 0.4,
                      opacity: 0
                    }}
                    animate={{ 
                      scale: 1.2,
                      opacity: 1
                    }}
                    transition={{ 
                      duration: 2.8,
                      delay: 0.3,
                      ease: [0.34, 1.56, 0.64, 1] 
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
                      marginTop: '2em',
                      textShadow: '0 2px 10px rgba(27, 22, 32, 0.2)',
                    }}
                    initial={{ 
                      scale: 0.4,
                      opacity: 0
                    }}
                    animate={{ 
                      scale: 1,
                      opacity: 1
                    }}
                    transition={{ 
                      duration: 2.5,
                      delay: 0.6,
                      ease: [0.16, 1, 0.3, 1] 
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
