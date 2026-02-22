'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: tokens.motion.duration.slow / 1000,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export function Hero() {
  const { t, lang } = useI18n();
  const router = useRouter();

  return (
    <section 
      className="min-h-screen flex items-center justify-center px-4 py-20"
      aria-label="Hero section"
    >
      <motion.div
        className="max-w-4xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        role="region"
        aria-labelledby="hero-title"
      >
        <motion.p
          className="mb-3 text-lg"
          variants={itemVariants}
          style={{ color: tokens.colors.text.secondary }}
        >
          {t('hero_kicker')}
        </motion.p>

        <motion.h1
          id="hero-title"
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight tracking-tight"
          variants={itemVariants}
          style={{
            fontFamily: tokens.typography.fontFamily.serif.join(', '),
            color: tokens.colors.text.primary,
          }}
        >
          {t('hero_title')}
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
          variants={itemVariants}
          style={{ color: tokens.colors.text.secondary }}
        >
          {t('hero_subtitle')}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4 justify-center mb-8"
          variants={itemVariants}
        >
          <Button variant="primary" onClick={() => {
            // Scroll to journey section instead of navigating to pricing
            const journeyElement = document.getElementById('journey');
            if (journeyElement) {
              journeyElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}>
            {lang === 'tr' ? 'Düğününüzün ilk izlenimi oluştur' : 'Create your wedding\'s first impression'}
          </Button>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          variants={itemVariants}
        >
          <span 
            className="px-3 py-2 rounded-full border text-sm"
            style={{
              borderColor: tokens.colors.border.light,
              backgroundColor: tokens.colors.bg.panel,
              color: tokens.colors.text.secondary,
            }}
          >
            {t('badge_1')}
          </span>
          <span 
            className="px-3 py-2 rounded-full border text-sm"
            style={{
              borderColor: tokens.colors.border.light,
              backgroundColor: tokens.colors.bg.panel,
              color: tokens.colors.text.secondary,
            }}
          >
            {t('badge_2')}
          </span>
          <span 
            className="px-3 py-2 rounded-full border text-sm"
            style={{
              borderColor: tokens.colors.border.light,
              backgroundColor: tokens.colors.bg.panel,
              color: tokens.colors.text.secondary,
            }}
          >
            {t('badge_3')}
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

