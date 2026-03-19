'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';
import { Card } from '@/components/ui/Card';

const testimonials = {
  en: [
    { quote: '"We set it up in one evening. Three days later, we had 80 confirmed RSVPs—no chasing anyone."', who: '— A & E' },
    { quote: '"Our parents kept asking how we made something this polished. We just picked a theme."', who: '— L & R' },
    { quote: '"I dreaded managing guest lists. The dashboard handled everything—I just checked in once a day."', who: '— S & M' },
    { quote: '"Guests replied within minutes. Some even sent us love notes through the invitation."', who: '— M & J' },
    { quote: '"We skipped the printing chaos entirely. Best decision of our wedding planning."', who: '— K & D' },
  ],
  tr: [
    { quote: '"Bir akşamda kurduk. Üç gün sonra elimizde 80 onaylı RSVP vardı—kimsenin peşinden koşmadık."', who: '— A & E' },
    { quote: '"Ailemiz bu kadar profesyonel bir şeyi nasıl yaptığımızı sormaya devam etti. Biz sadece tema seçtik."', who: '— L & R' },
    { quote: '"Misafir listesi yönetmekten korkuyordum. Panel her şeyi halletti—günde bir kez baktım yetti."', who: '— S & M' },
    { quote: '"Misafirler dakikalar içinde yanıtladı. Bazıları davetiye üzerinden bize mesaj bile yazdı."', who: '— M & J' },
    { quote: '"Basılı davetiye kaosunu tamamen atladık. Düğün planlamasının en iyi kararıydı."', who: '— K & D' },
  ],
};

export function LoveNotes() {
  const { t, lang } = useI18n();
  const [index, setIndex] = useState(0);
  const currentTestimonials = testimonials[lang as 'en' | 'tr'] || testimonials.en;

  const next = () => setIndex((i) => (i + 1) % currentTestimonials.length);
  const prev = () => setIndex((i) => (i - 1 + currentTestimonials.length) % currentTestimonials.length);

  return (
    <section id="love-notes" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: tokens.motion.duration.med / 1000 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: tokens.typography.fontFamily.serif.join(', ') }}>
            {t('love_notes_title')}
          </h2>
          <p className="text-xl" style={{ color: tokens.colors.text.secondary }}>
            {t('love_notes_subtitle')}
          </p>
        </motion.div>

        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--crimson-base)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            aria-label="Previous"
          >
            ←
          </button>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <Card>
              <p className="text-xl mb-4 italic" style={{ fontFamily: tokens.typography.fontFamily.serif.join(', ') }}>
                {currentTestimonials[index].quote}
              </p>
              <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                {currentTestimonials[index].who}
              </p>
            </Card>
          </motion.div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:text-white"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--crimson-base)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}

