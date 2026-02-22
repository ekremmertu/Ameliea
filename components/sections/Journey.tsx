'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';
import { Card } from '@/components/ui/Card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: tokens.motion.duration.med / 1000,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export function Journey() {
  const { t } = useI18n();

  return (
    <section id="journey" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: tokens.motion.duration.med / 1000 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: tokens.typography.fontFamily.serif.join(', ') }}>
            {t('journey_title')}
          </h2>
          <p className="text-xl" style={{ color: tokens.colors.text.secondary }}>
            {t('journey_subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-2xl font-bold mb-3">{t('journey_1_title')}</h3>
              <p style={{ color: tokens.colors.text.secondary }}>{t('journey_1_body')}</p>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-2xl font-bold mb-3">{t('journey_2_title')}</h3>
              <p style={{ color: tokens.colors.text.secondary }}>{t('journey_2_body')}</p>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-2xl font-bold mb-3">{t('journey_3_title')}</h3>
              <p style={{ color: tokens.colors.text.secondary }}>{t('journey_3_body')}</p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

