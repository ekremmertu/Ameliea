'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface InvitationVideoProps {
  videoUrl: string;
  themeColor: string;
}

export function InvitationVideo({ videoUrl, themeColor }: InvitationVideoProps) {
  const { lang } = useI18n();

  if (!videoUrl) return null;

  // Extract video ID from YouTube/Vimeo URL
  const getVideoId = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1]?.split('&')[0];
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0];
    }
    if (url.includes('vimeo.com/')) {
      return url.split('vimeo.com/')[1]?.split('?')[0];
    }
    return null;
  };

  const videoId = getVideoId(videoUrl);
  if (!videoId) return null;

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const embedUrl = isYouTube
    ? `https://www.youtube.com/embed/${videoId}`
    : `https://player.vimeo.com/video/${videoId}`;

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {lang === 'tr' ? 'Özel Video' : 'Special Video'}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl"
          style={{
            border: `3px solid ${themeColor}`,
          }}
        >
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lang === 'tr' ? 'Düğün Videosu' : 'Wedding Video'}
          />
        </motion.div>
      </div>
    </section>
  );
}

