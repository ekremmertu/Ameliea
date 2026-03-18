'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';
import { I18nKey } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getThemeAssetsForHomepage } from '@/lib/theme-assets';

function ThemeImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center text-center px-4"
        style={{ background: 'linear-gradient(135deg, var(--gold-light), var(--rose-light))', color: 'var(--ink-base)' }}
      >
        <span className="text-sm font-medium">Görsel yüklenemedi</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      onError={() => setError(true)}
    />
  );
}

/** Telefon çerçevesi içinde tema önizleme videosu */
function ThemeVideoModal({
  videoUrl,
  themeName,
  onClose,
  onContinue,
  lang,
}: {
  videoUrl: string;
  themeName: string;
  onClose: () => void;
  onContinue: () => void;
  lang: string;
}) {
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="relative flex flex-col items-center max-w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Telefon çerçevesi */}
        <div
          className="relative rounded-[2.5rem] p-2 sm:p-3 shadow-2xl border-[6px] border-[#1b1620] bg-[#1b1620]"
          style={{
            width: 'min(320px, 85vw)',
            aspectRatio: '9/19',
            maxHeight: '75vh',
          }}
        >
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-black">
            {videoError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
                <p className="text-sm">{lang === 'tr' ? 'Video yüklenemedi.' : 'Video could not be loaded.'}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-full font-medium bg-white/20"
                >
                  {lang === 'tr' ? 'Kapat' : 'Close'}
                </button>
              </div>
            ) : (
              <>
                <video
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted={false}
                  controls
                  onEnded={() => setVideoEnded(true)}
                  onError={() => setVideoError(true)}
                />
                {videoEnded && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 text-white p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-sm font-medium">
                      {lang === 'tr' ? 'Önizleme bitti.' : 'Preview finished.'}
                    </p>
                    <button
                      type="button"
                      onClick={onContinue}
                      className="px-8 py-4 rounded-full font-semibold shadow-lg"
                      style={{ backgroundColor: tokens.colors.gold.base, color: '#1b1620' }}
                    >
                      {lang === 'tr' ? 'Devam et' : 'Continue'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Dinamik çentik (üst orta) */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 rounded-b-2xl bg-[#1b1620] z-10"
            style={{ marginTop: '-1px' }}
          />
        </div>

        <p className="mt-4 text-white/90 text-sm font-medium">{themeName}</p>

        {/* Kapat butonu */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 sm:top-0 sm:right-0 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
          aria-label={lang === 'tr' ? 'Kapat' : 'Close'}
        >
          <span className="text-xl leading-none">&times;</span>
        </button>
      </motion.div>
    </motion.div>
  );
}

export function Themes() {
  const { t, lang } = useI18n();
  const themes = getThemeAssetsForHomepage();
  const [previewTheme, setPreviewTheme] = useState<typeof themes[0] | null>(null);

  const openPreview = useCallback((theme: typeof themes[0]) => setPreviewTheme(theme), []);
  const closePreview = useCallback(() => setPreviewTheme(null), []);

  return (
    <section id="themes" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: tokens.motion.duration.med / 1000 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: tokens.typography.fontFamily.serif.join(', ') }}>
            {t('themes_title')}
          </h2>
          <p className="text-xl" style={{ color: tokens.colors.text.secondary }}>
            {t('themes_subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {themes.map((theme, index) => (
            <motion.div
              key={theme.styleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: tokens.motion.duration.med / 1000, delay: index * 0.1 }}
            >
              <Card>
                {/* Kutuda Zarf görseli — tıklanınca önizleme videosu açılır */}
                <button
                  type="button"
                  className="relative h-48 w-full rounded-xl mb-4 overflow-hidden bg-[var(--bg-secondary)] block text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--gold-base)]"
                  onClick={() => openPreview(theme)}
                  aria-label={t('view_preview')}
                >
                  <ThemeImage src={theme.imageUrl} alt={t(theme.titleKey as I18nKey)} />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                    <span className="opacity-0 hover:opacity-100 transition-opacity rounded-full bg-white/90 text-[#1b1620] px-4 py-2 text-sm font-medium flex items-center gap-2">
                      <span aria-hidden>▶</span> {t('view_preview')}
                    </span>
                  </div>
                </button>
                <h3 className="text-xl font-bold mb-2">{t(theme.titleKey as I18nKey)}</h3>
                <p className="text-sm mb-4" style={{ color: tokens.colors.text.secondary }}>
                  {t(theme.descKey as I18nKey)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="text-sm"
                    onClick={() => openPreview(theme)}
                  >
                    {t('view_preview')}
                  </Button>
                  <Button
                    variant="primary"
                    className="text-sm"
                    onClick={() => { window.location.href = `/customize/${theme.styleKey}`; }}
                  >
                    {lang === 'tr' ? 'Bu temayı seç' : 'Choose this theme'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {previewTheme && (
          <ThemeVideoModal
            key={previewTheme.styleKey}
            videoUrl={previewTheme.videoUrl}
            themeName={t(previewTheme.titleKey as I18nKey)}
            onClose={closePreview}
            onContinue={closePreview}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
