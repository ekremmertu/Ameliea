'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface CountdownTimerProps {
  weddingDate: string;
  weddingTime: string;
  themeColor?: string;
  minDays?: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function FlipDigit({ value, label, themeColor, isSeconds }: { value: number; label: string; themeColor: string; isSeconds?: boolean }) {
  return (
    <motion.div
      key={`${label}-${value}`}
      initial={{ scale: 0.8, opacity: 0, rotateX: -90 }}
      animate={{ scale: 1, opacity: 1, rotateX: 0 }}
      transition={{ 
        duration: isSeconds ? 0.4 : 0.3,
        type: isSeconds ? 'spring' : 'tween',
        stiffness: isSeconds ? 300 : undefined,
        damping: isSeconds ? 20 : undefined,
      }}
      className="flex flex-col items-center"
    >
      <motion.div
        className="relative w-[72px] h-[80px] md:w-[90px] md:h-[100px] rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: `${themeColor}15`,
          border: `2px solid ${themeColor}30`,
          boxShadow: `0 8px 32px ${themeColor}15, 0 2px 8px ${themeColor}10`,
        }}
        whileHover={{ scale: 1.05, boxShadow: `0 12px 40px ${themeColor}25` }}
        animate={isSeconds ? {
          boxShadow: [
            `0 8px 32px ${themeColor}15, 0 2px 8px ${themeColor}10`,
            `0 8px 32px ${themeColor}25, 0 2px 8px ${themeColor}20`,
            `0 8px 32px ${themeColor}15, 0 2px 8px ${themeColor}10`,
          ],
        } : undefined}
        transition={isSeconds ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ 
            background: `linear-gradient(135deg, ${themeColor}, transparent)`,
          }}
        />
        <motion.span
          className="relative text-3xl md:text-4xl font-bold tabular-nums"
          style={{
            fontFamily: tokens.typography.fontFamily.serif.join(', '),
            color: tokens.colors.text.primary,
          }}
          animate={isSeconds ? { scale: [1, 1.05, 1] } : undefined}
          transition={isSeconds ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : undefined}
        >
          {value.toString().padStart(2, '0')}
        </motion.span>
      </motion.div>
      <span
        className="mt-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em]"
        style={{ color: tokens.colors.text.secondary }}
      >
        {label}
      </span>
    </motion.div>
  );
}

function Separator({ themeColor }: { themeColor: string }) {
  return (
    <motion.div 
      className="flex flex-col items-center gap-2 pt-4 md:pt-5"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${themeColor}80` }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${themeColor}80` }} />
    </motion.div>
  );
}

export function CountdownTimer({ weddingDate, weddingTime, themeColor = '#c8a24a', minDays }: CountdownTimerProps) {
  const { t } = useI18n();
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

      if (minDays !== undefined && days < minDays) {
        days = minDays;
      }

      secondsRef.current = seconds;
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [weddingDate, weddingTime, minDays]);

  if (!weddingDate || !weddingTime || !timeLeft) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7 }}
      className="py-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.2em] mb-3"
          style={{ color: themeColor }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✨ {t('invitation_countdown')} ✨
        </motion.p>
        <motion.h3
          className="text-2xl md:text-3xl font-bold"
          style={{
            fontFamily: tokens.typography.fontFamily.serif.join(', '),
            color: tokens.colors.text.primary,
            fontStyle: 'italic',
          }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t('invitation_countdown_subtitle')}
        </motion.h3>
      </div>

      {/* Timer */}
      <div className="flex items-start justify-center gap-2 md:gap-4">
        <FlipDigit value={timeLeft.days} label={t('invitation_countdown_days')} themeColor={themeColor} />
        <Separator themeColor={themeColor} />
        <FlipDigit value={timeLeft.hours} label={t('invitation_countdown_hours')} themeColor={themeColor} />
        <Separator themeColor={themeColor} />
        <FlipDigit value={timeLeft.minutes} label={t('invitation_countdown_minutes')} themeColor={themeColor} />
        <Separator themeColor={themeColor} />
        <FlipDigit value={timeLeft.seconds} label={t('invitation_countdown_seconds')} themeColor={themeColor} isSeconds />
      </div>

      {isExpired && (
        <motion.p
          className="text-center mt-6 text-base font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: themeColor,
            fontFamily: tokens.typography.fontFamily.serif.join(', '),
            fontStyle: 'italic',
          }}
        >
          {t('invitation_countdown_expired')}
        </motion.p>
      )}
    </motion.div>
  );
}
