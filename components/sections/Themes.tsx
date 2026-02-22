'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';
import { I18nKey } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const themes = [
  { key: 'style_1', titleKey: 'style_1_title', descKey: 'style_1_desc' },
  { key: 'style_2', titleKey: 'style_2_title', descKey: 'style_2_desc' },
  { key: 'style_3', titleKey: 'style_3_title', descKey: 'style_3_desc' },
  { key: 'style_4', titleKey: 'style_4_title', descKey: 'style_4_desc' },
  { key: 'style_5', titleKey: 'style_5_title', descKey: 'style_5_desc' },
] as const;

export function Themes() {
  const { t } = useI18n();

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
              key={theme.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: tokens.motion.duration.med / 1000, delay: index * 0.1 }}
            >
              <Card>
                <div className="h-40 rounded-xl mb-4 bg-gradient-to-br from-[var(--gold-light)] to-[var(--rose-light)]" />
                <h3 className="text-xl font-bold mb-2">{t(theme.titleKey as I18nKey)}</h3>
                <p className="text-sm mb-4" style={{ color: tokens.colors.text.secondary }}>
                  {t(theme.descKey as I18nKey)}
                </p>
                <Button 
                  variant="ghost" 
                  className="text-sm"
                  onClick={() => {
                    // Navigate to customization page
                    window.location.href = `/customize/${theme.key}`;
                  }}
                >
                  {t('view_preview')}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

