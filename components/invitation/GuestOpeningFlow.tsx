'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { getTemplateMedia } from '@/lib/invitation-media';
import type { ThemeId } from '@/lib/themes';

export interface GuestOpeningFlowData {
  coupleName: string;
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  weddingTime?: string;
  venueName?: string;
  venueAddress?: string;
  personalMessage?: string;
  themeId?: ThemeId;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

interface GuestOpeningFlowProps {
  data: GuestOpeningFlowData;
  onComplete: () => void;
}

type Stage = 'info' | 'video' | 'cover';

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.15 + 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function formatDate(lang: string, dateStr?: string) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr?: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function GuestOpeningFlow({ data, onComplete }: GuestOpeningFlowProps) {
  const { lang } = useI18n();
  /** Davetli linki açınca önce tema videosu, sonra bilgiler, sonra Zarf kapak → ana davetiye (detay + anket) */
  const [stage, setStage] = useState<Stage>('video');
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [coverLoadError, setCoverLoadError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const skipLabel = lang === 'tr' ? 'Geç' : 'Skip';

  const handleSkip = useCallback(() => {
    if (stage === 'video') setStage('info');
    else if (stage === 'info') setStage('cover');
    else onComplete();
  }, [stage, onComplete]);

  /** Sol üstte her aşamada görünen skip butonu */
  const SkipButton = () => (
    <button
      type="button"
      onClick={handleSkip}
      className="fixed top-4 left-4 z-[101] px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
      style={{
        backgroundColor: 'rgba(0,0,0,0.4)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.5)',
      }}
      aria-label={skipLabel}
    >
      {skipLabel}
    </button>
  );

  const themeId = (data.themeId || 'elegant') as ThemeId;
  const media = getTemplateMedia(themeId);
  const primary = data.theme?.primaryColor || '#c8a24a';
  const secondary = data.theme?.secondaryColor || '#a12b3a';

  /** Video bittikten sonra bilgi ekranına geç (sonra Zarf, sonra ana davetiye) */
  const handleVideoEnded = useCallback(() => {
    setStage('info');
    setVideoStarted(false);
  }, []);

  const infoItems = [
    { label: lang === 'tr' ? 'Davetliler' : 'Host', value: data.coupleName || `${data.brideName} & ${data.groomName}` },
    { label: lang === 'tr' ? 'Tarih' : 'Date', value: formatDate(lang, data.weddingDate) },
    ...(formatTime(data.weddingDate) ? [{ label: lang === 'tr' ? 'Saat' : 'Time', value: formatTime(data.weddingDate) }] : []),
    { label: lang === 'tr' ? 'Mekan' : 'Venue', value: data.venueName || data.venueAddress || '—' },
    ...(data.personalMessage ? [{ label: lang === 'tr' ? 'Mesaj' : 'Message', value: data.personalMessage }] : []),
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <AnimatePresence mode="wait">
      {/* 1) Bilgi listesi - geçiş animasyonlu */}
      {stage === 'info' && (
        <motion.div
          key="info"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 py-12 overflow-auto"
          style={{ background: `linear-gradient(180deg, ${secondary}22 0%, ${primary}22 100%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SkipButton />
          <motion.p
            className="text-sm uppercase tracking-widest mb-8"
            style={{ color: primary }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {lang === 'tr' ? 'Davetiyeniz' : 'Your invitation'}
          </motion.p>
          <ul className="space-y-4 max-w-md w-full">
            {infoItems.map((item, i) => (
              <motion.li
                key={item.label}
                custom={i}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-1 rounded-xl px-5 py-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
              >
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: primary }}>
                  {item.label}
                </span>
                <span className="text-base font-medium" style={{ color: '#1a1a1a' }}>
                  {item.value}
                </span>
              </motion.li>
            ))}
          </ul>
          <motion.button
            type="button"
            onClick={() => setStage('cover')}
            className="mt-10 px-8 py-4 rounded-full font-semibold text-white shadow-lg"
            style={{ backgroundColor: primary }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            {lang === 'tr' ? 'Devam et' : 'Continue'}
          </motion.button>
        </motion.div>
      )}

      {/* 2) Tema açılış videosu (5 temada 5 video - seçilen temanın videosu) */}
      {stage === 'video' && (
        <motion.div
          key="video"
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SkipButton />
          {videoLoadError ? (
            <div className="flex flex-col items-center justify-center gap-6 text-white text-center px-6">
              <p className="text-lg">{lang === 'tr' ? 'Medya yüklenemedi.' : 'Media could not be loaded.'}</p>
              <button
                type="button"
                onClick={handleVideoEnded}
                className="px-8 py-4 rounded-full font-semibold text-white"
                style={{ backgroundColor: primary }}
              >
                {lang === 'tr' ? 'Devam et' : 'Continue'}
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                src={media.introVideoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted={false}
                onEnded={handleVideoEnded}
                onError={() => setVideoLoadError(true)}
                onClick={() => videoRef.current?.play()}
              />
              {!videoStarted && !videoLoadError && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    videoRef.current?.play();
                    setVideoStarted(true);
                  }}
                >
                  <span
                    className="text-white text-lg font-medium px-6 py-3 rounded-full border-2 border-white/80"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                  >
                    {lang === 'tr' ? 'Başlatmak için dokunun' : 'Tap to start'}
                  </span>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* 3) Davetiye görseli - düğün sahibi bilgileri üzerinde */}
      {stage === 'cover' && (
        <motion.div
          key="cover"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onComplete}
        >
          <SkipButton />
          <div className="absolute inset-0">
            <img
              src={coverLoadError ? media.fallbackCoverImageUrl : media.coverImageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setCoverLoadError(true)}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%, transparent 100%)`,
              }}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 pb-16 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'serif' }}>
              {data.coupleName || `${data.brideName} & ${data.groomName}`}
            </h2>
            <p className="text-lg opacity-95">{formatDate(lang, data.weddingDate)}</p>
            {(data.venueName || data.venueAddress) && (
              <p className="mt-2 text-sm opacity-90">{data.venueName || data.venueAddress}</p>
            )}
            <p className="mt-6 text-sm opacity-80">
              {lang === 'tr' ? 'Devam etmek için dokunun' : 'Tap to continue'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
