'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';
import { I18nKey } from '@/lib/i18n';

const faqs = [
  { q: 'faq_q1', a: 'faq_a1' },
  { q: 'faq_q2', a: 'faq_a2' },
  { q: 'faq_q3', a: 'faq_a3' },
  { q: 'faq_q4', a: 'faq_a4' },
  { q: 'faq_q5', a: 'faq_a5' },
  { q: 'faq_q6', a: 'faq_a6' },
] as const;

export function FAQ() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, var(--bg-primary), var(--bg-secondary))' }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-5" style={{ background: 'var(--gold-base)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full opacity-5" style={{ background: 'var(--crimson-base)', filter: 'blur(80px)' }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6" 
            style={{ 
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              letterSpacing: '-0.02em',
            }}
          >
            {t('faq_title')}
          </h2>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto" style={{ color: tokens.colors.text.secondary }}>
            Everything you need to know
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-8 py-6 rounded-2xl border-2 transition-all flex justify-between items-center group"
                style={{ 
                  backgroundColor: openIndex === index ? 'var(--bg-panel-strong)' : 'var(--bg-panel)',
                  borderColor: openIndex === index ? 'var(--crimson-base)' : 'rgba(200, 162, 74, 0.2)',
                }}
                onMouseEnter={(e) => { 
                  if (openIndex !== index) {
                    e.currentTarget.style.borderColor = 'rgba(200, 162, 74, 0.4)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-panel-strong)';
                  }
                }}
                onMouseLeave={(e) => { 
                  if (openIndex !== index) {
                    e.currentTarget.style.borderColor = 'rgba(200, 162, 74, 0.2)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
                  }
                }}
              >
                <span className="font-semibold text-lg pr-4" style={{ color: tokens.colors.text.primary }}>
                  {t(faq.q as I18nKey)}
                </span>
                <span 
                  className="text-2xl transition-transform flex-shrink-0"
                  style={{ 
                    color: openIndex === index ? 'var(--crimson-base)' : tokens.colors.text.secondary,
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ↓
                </span>
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-8 py-6 mt-2 rounded-2xl"
                  style={{ 
                    backgroundColor: 'var(--bg-panel-strong)',
                    borderLeft: '4px solid var(--crimson-base)',
                  }}
                >
                  <p className="leading-relaxed text-base" style={{ color: tokens.colors.text.secondary }}>
                    {t(faq.a as I18nKey)}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

