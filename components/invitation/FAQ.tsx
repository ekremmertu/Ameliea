'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  faqs: FAQItem[];
}

export function FAQ({ faqs }: FAQProps) {
  const { lang } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const validFAQs = faqs.filter(faq => faq.question && faq.answer);

  if (validFAQs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ border: '2px solid rgba(200, 162, 74, 0.3)' }}>
            <span className="text-2xl" style={{ color: 'var(--gold-base)' }}>?</span>
          </div>
          <h2 
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {lang === 'tr' ? 'Sıkça Sorulan Sorular' : 'Frequently Asked Questions'}
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {validFAQs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                border: '1px solid rgba(200, 162, 74, 0.2)',
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors"
                style={{
                  backgroundColor: openIndex === index ? 'rgba(200, 162, 74, 0.05)' : 'transparent',
                }}
              >
                <span 
                  className="text-base md:text-lg font-semibold flex-1 pr-4"
                  style={{ color: tokens.colors.text.primary }}
                >
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl"
                  style={{ color: tokens.colors.text.secondary }}
                >
                  ▼
                </motion.span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div 
                      className="px-6 pb-4 pt-2"
                      style={{ color: tokens.colors.text.secondary }}
                    >
                      <p className="text-sm md:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

