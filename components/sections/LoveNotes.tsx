'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';
import { Card } from '@/components/ui/Card';

const testimonials = {
  en: [
    { quote: '"We set it up in 10 minutes and never had to answer \'where\'s the venue?\' again."', who: '— A & E' },
    { quote: '"Our guests actually RSVP\'d on time. That alone was worth it."', who: '— L & R' },
    { quote: '"We skipped the paper invites and put the savings toward the honeymoon."', who: '— S & M' },
    { quote: '"The dashboard let us see exactly who was coming—no more guessing at the caterer\'s count."', who: '— M & J' },
    { quote: '"Three couples at our wedding asked us how we made it. That says everything."', who: '— K & D' },
  ],
  tr: [
    { quote: '"10 dakikada kurduk, bir daha kimse \'mekan nerede?\' diye sormadı."', who: '— A & E' },
    { quote: '"Misafirlerimiz gerçekten zamanında RSVP yaptı. Sadece bu bile yeterliydi."', who: '— L & R' },
    { quote: '"Kağıt davetiyeyi atladık, tasarrufu balayına yatırdık."', who: '— S & M' },
    { quote: '"Panelden kimin geldiğini anlık gördük—catering sayısında artık tahmin yok."', who: '— M & J' },
    { quote: '"Düğünümüzde üç çift nasıl yaptığımızı sordu. Bu her şeyi anlatıyor."', who: '— K & D' },
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

