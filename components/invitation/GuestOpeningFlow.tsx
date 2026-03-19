'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
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
}

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

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.15 + 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function GuestOpeningFlow({ data }: GuestOpeningFlowProps) {
  const { lang } = useI18n();
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const themeId = (data.themeId || 'elegant') as ThemeId;
  const media = getTemplateMedia(themeId);
  const primary = data.theme?.primaryColor || '#c8a24a';
  const secondary = data.theme?.secondaryColor || '#a12b3a';

  const infoItems = [
    { label: lang === 'tr' ? 'Davetliler' : 'Host', value: data.coupleName || `${data.brideName} & ${data.groomName}` },
    { label: lang === 'tr' ? 'Tarih' : 'Date', value: formatDate(lang, data.weddingDate) },
    ...(formatTime(data.weddingDate) ? [{ label: lang === 'tr' ? 'Saat' : 'Time', value: formatTime(data.weddingDate) }] : []),
    { label: lang === 'tr' ? 'Mekan' : 'Venue', value: data.venueName || data.venueAddress || '—' },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section className="relative">
      {/* Video Section */}
      <div className="relative w-full min-h-screen overflow-hidden bg-black">
        {videoLoadError ? (
          <div className="absolute inset-0">
            <img
              src={media.coverImageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = media.fallbackCoverImageUrl; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={media.introVideoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted={false}
              loop
              onError={() => setVideoLoadError(true)}
              onClick={() => {
                if (!videoStarted) {
                  videoRef.current?.play();
                  setVideoStarted(true);
                }
              }}
            />
            {!videoStarted && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10"
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
              </div>
            )}
          </>
        )}

        {/* Overlay info at bottom of video */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 text-center text-white z-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'serif' }}>
              {data.coupleName || `${data.brideName} & ${data.groomName}`}
            </h2>
            <p className="text-lg opacity-95">{formatDate(lang, data.weddingDate)}</p>
            {(data.venueName || data.venueAddress) && (
              <p className="mt-2 text-sm opacity-90">{data.venueName || data.venueAddress}</p>
            )}
            <motion.p
              className="mt-6 text-sm opacity-70"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ↓ {lang === 'tr' ? 'Aşağı kaydırın' : 'Scroll down'}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Info Items - visible when scrolling down */}
      <div
        className="py-12 px-6"
        style={{ background: `linear-gradient(180deg, ${secondary}22 0%, ${primary}22 100%)` }}
      >
        <motion.p
          className="text-sm uppercase tracking-widest mb-8 text-center"
          style={{ color: primary }}
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {lang === 'tr' ? 'Davetiyeniz' : 'Your invitation'}
        </motion.p>
        <ul className="space-y-4 max-w-md w-full mx-auto">
          {infoItems.map((item, i) => (
            <motion.li
              key={item.label}
              custom={i}
              variants={listItemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
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
        {data.personalMessage && (
          <motion.p
            className="text-center mt-8 text-base max-w-md mx-auto"
            style={{ color: '#1a1a1a', fontStyle: 'italic' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            &ldquo;{data.personalMessage}&rdquo;
          </motion.p>
        )}
      </div>
    </section>
  );
}
