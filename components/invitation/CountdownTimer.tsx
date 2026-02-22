'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface CountdownTimerProps {
  weddingDate: string; // YYYY-MM-DD format
  weddingTime: string; // HH:mm format
  themeColor?: string;
  minDays?: number; // Minimum gün sayısı (demo/tanıtım için)
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}


export function CountdownTimer({ weddingDate, weddingTime, themeColor = '#c8a24a', minDays }: CountdownTimerProps) {
  const { lang } = useI18n();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const secondsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!weddingDate || !weddingTime) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const weddingDateTime = new Date(`${weddingDate}T${weddingTime}:00`);
      
      // Check if wedding date is in the past
      if (weddingDateTime <= now) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsExpired(false);
      const difference = weddingDateTime.getTime() - now.getTime();

      let days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Eğer minDays belirtilmişse ve gün sayısı minDays'den azsa, minDays'e çıkar
      if (minDays !== undefined && days < minDays) {
        days = minDays;
      }

      secondsRef.current = seconds;
      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [weddingDate, weddingTime]);

  if (!weddingDate || !weddingTime || !timeLeft) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-6 p-6 rounded-xl"
      style={{ 
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid rgba(200, 162, 74, 0.2)',
      }}
    >
      <div className="text-center mb-6">
        <h3 
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{
            fontFamily: tokens.typography.fontFamily.serif.join(', '),
            color: tokens.colors.text.primary,
          }}
        >
          {lang === 'tr' ? 'Geri Sayım' : 'Countdown'}
        </h3>
        <p 
          className="text-sm md:text-base"
          style={{ color: tokens.colors.text.secondary }}
        >
          {lang === 'tr' 
            ? 'Hayatımızın en özel gününe kadar'
            : 'Until the most special day of our lives'}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {/* Days */}
        <motion.div
          key={`days-${timeLeft.days}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6 rounded-xl text-center relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(200, 162, 74, 0.1)',
            border: '1px solid rgba(200, 162, 74, 0.3)',
          }}
        >
          <div className="absolute inset-0 opacity-5" style={{ background: 'var(--gold-base)' }} />
          <div className="relative">
            <div 
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ 
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              {timeLeft.days}
            </div>
            <div 
              className="text-xs md:text-sm font-medium uppercase tracking-wider"
              style={{ color: tokens.colors.text.secondary }}
            >
              {lang === 'tr' ? 'Gün' : 'Days'}
            </div>
          </div>
        </motion.div>

        {/* Hours */}
        <motion.div
          key={`hours-${timeLeft.hours}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6 rounded-xl text-center relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(200, 162, 74, 0.1)',
            border: '1px solid rgba(200, 162, 74, 0.3)',
          }}
        >
          <div className="absolute inset-0 opacity-5" style={{ background: 'var(--gold-base)' }} />
          <div className="relative">
            <div 
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ 
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              {timeLeft.hours}
            </div>
            <div 
              className="text-xs md:text-sm font-medium uppercase tracking-wider"
              style={{ color: tokens.colors.text.secondary }}
            >
              {lang === 'tr' ? 'Saat' : 'Hours'}
            </div>
          </div>
        </motion.div>

        {/* Minutes */}
        <motion.div
          key={`minutes-${timeLeft.minutes}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6 rounded-xl text-center relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(200, 162, 74, 0.1)',
            border: '1px solid rgba(200, 162, 74, 0.3)',
          }}
        >
          <div className="absolute inset-0 opacity-5" style={{ background: 'var(--gold-base)' }} />
          <div className="relative">
            <div 
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ 
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              {timeLeft.minutes}
            </div>
            <div 
              className="text-xs md:text-sm font-medium uppercase tracking-wider"
              style={{ color: tokens.colors.text.secondary }}
            >
              {lang === 'tr' ? 'Dakika' : 'Minutes'}
            </div>
          </div>
        </motion.div>

        {/* Seconds */}
        <motion.div
          key={`seconds-${timeLeft.seconds}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6 rounded-xl text-center relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(200, 162, 74, 0.1)',
            border: '1px solid rgba(200, 162, 74, 0.3)',
          }}
        >
          <div className="absolute inset-0 opacity-5" style={{ background: 'var(--gold-base)' }} />
          <div className="relative">
            <div 
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ 
                fontFamily: tokens.typography.fontFamily.serif.join(', '),
                color: tokens.colors.text.primary,
              }}
            >
              {timeLeft.seconds}
            </div>
            <div 
              className="text-xs md:text-sm font-medium uppercase tracking-wider"
              style={{ color: tokens.colors.text.secondary }}
            >
              {lang === 'tr' ? 'Saniye' : 'Seconds'}
            </div>
          </div>
        </motion.div>
      </div>

      {isExpired && (
        <p 
          className="text-center mt-4 text-sm"
          style={{ color: tokens.colors.text.muted }}
        >
          {lang === 'tr' 
            ? 'Düğün tarihi geçmiş'
            : 'Wedding date has passed'}
        </p>
      )}
    </motion.div>
  );
}

