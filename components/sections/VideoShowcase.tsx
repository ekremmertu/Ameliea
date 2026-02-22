'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';

interface VideoShowcaseProps {
  videoUrl?: string; // Video URL - şimdilik placeholder, sonra eklenecek
}

export function VideoShowcase({ videoUrl }: VideoShowcaseProps) {
  const { lang } = useI18n();

  return (
    <section className="py-24 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {lang === 'tr' ? 'Davetiyenizi Görün' : 'See Your Invitation'}
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' 
              ? 'Misafirlerinizin göreceği deneyimi keşfedin'
              : 'Discover the experience your guests will see'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center"
        >
          {/* iPhone Mockup */}
          <div className="relative">
            {/* iPhone Frame */}
            <div
              className="relative mx-auto"
              style={{
                width: 'min(375px, 90vw)',
                maxWidth: '375px',
                padding: '12px',
                borderRadius: '50px',
                background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              {/* Notch */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20"
                style={{
                  width: '150px',
                  height: '30px',
                  borderRadius: '0 0 20px 20px',
                  background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                }}
              />

              {/* Screen */}
              <div
                className="relative overflow-hidden rounded-[38px]"
                style={{
                  width: '100%',
                  aspectRatio: '9 / 19.5',
                  background: '#000',
                  boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Video Container */}
                <div className="relative w-full h-full">
                  {videoUrl ? (
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                    >
                      <source src={videoUrl} type="video/mp4" />
                      <source src={videoUrl} type="video/webm" />
                      {lang === 'tr' 
                        ? 'Tarayıcınız video oynatmayı desteklemiyor.'
                        : 'Your browser does not support video playback.'}
                    </video>
                  ) : (
                    // Placeholder - Video eklenecek
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 via-purple-100 to-pink-100">
                      <div className="text-center p-8">
                        <div className="text-6xl mb-4">📹</div>
                        <p 
                          className="text-lg font-semibold mb-2"
                          style={{ color: tokens.colors.text.primary }}
                        >
                          {lang === 'tr' ? 'Video Yakında' : 'Video Coming Soon'}
                        </p>
                        <p 
                          className="text-sm"
                          style={{ color: tokens.colors.text.secondary }}
                        >
                          {lang === 'tr' 
                            ? 'Demo video yakında eklenecek'
                            : 'Demo video will be added soon'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Home Indicator (iPhone X and later) */}
              <div
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20"
                style={{
                  width: '134px',
                  height: '5px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Decorative Elements */}
            <div
              className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10 blur-3xl"
              style={{ background: 'var(--crimson-base)' }}
            />
            <div
              className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl"
              style={{ background: 'var(--gold-base)' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

