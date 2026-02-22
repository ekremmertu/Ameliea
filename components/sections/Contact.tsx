'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { logger } from '@/lib/logger';

export function Contact() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:8010/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      setFormData({ name: '', email: '', message: '' });
      showToast('Message sent!', 'success');
    } catch (err) {
      logger.error('Error sending message:', err);
      showToast('Error sending message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section 
      id="contact" 
      className="py-24 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)' }}
      aria-label="Contact section"
    >
      {/* Premium decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-5" style={{ background: 'var(--gold-base)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-5" style={{ background: 'var(--crimson-base)', filter: 'blur(100px)' }} />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block mb-6">
            <span className="px-4 py-2 rounded-full text-sm font-medium" style={{ 
              backgroundColor: 'rgba(200, 162, 74, 0.1)',
              color: 'var(--gold-base)',
              border: '1px solid rgba(200, 162, 74, 0.2)'
            }}>
              {t('contact_title')}
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ 
            fontFamily: tokens.typography.fontFamily.serif.join(', '),
            letterSpacing: '-0.02em',
          }}>
            {t('contact_title')}
          </h2>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
            {t('contact_subtitle')}
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          aria-label="Contact form"
        >
          <div className="p-8 rounded-3xl" style={{ 
            backgroundColor: 'var(--bg-panel-strong)',
            border: '2px solid rgba(200, 162, 74, 0.2)',
            boxShadow: '0 20px 60px rgba(27, 22, 32, 0.1)',
          }}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-3 text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
                  {t('contact_name')}
                </label>
                <input
                  id="name"
                  type="text"
                  inputMode="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border-2 focus:outline-none transition-all text-base"
                  style={{ 
                    backgroundColor: 'var(--bg-panel)', 
                    borderColor: 'var(--border-base)',
                    minHeight: '52px',
                    fontSize: '16px',
                  }}
                  onFocus={(e) => { 
                    e.currentTarget.style.borderColor = 'var(--crimson-base)';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(161, 43, 58, 0.1)';
                  }}
                  onBlur={(e) => { 
                    e.currentTarget.style.borderColor = 'var(--border-base)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-3 text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
                  {t('contact_email')}
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border-2 focus:outline-none transition-all text-base"
                  style={{ 
                    backgroundColor: 'var(--bg-panel)', 
                    borderColor: 'var(--border-base)',
                    minHeight: '52px',
                    fontSize: '16px',
                  }}
                  onFocus={(e) => { 
                    e.currentTarget.style.borderColor = 'var(--crimson-base)';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(161, 43, 58, 0.1)';
                  }}
                  onBlur={(e) => { 
                    e.currentTarget.style.borderColor = 'var(--border-base)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-3 text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
                  {t('contact_message')}
                </label>
                <textarea
                  id="message"
                  inputMode="text"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border-2 focus:outline-none transition-all resize-none text-base"
                  style={{ 
                    backgroundColor: 'var(--bg-panel)',
                    borderColor: 'var(--border-base)',
                    minHeight: '150px',
                    fontSize: '16px',
                  }}
                  onFocus={(e) => { 
                    e.currentTarget.style.borderColor = 'var(--crimson-base)';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(161, 43, 58, 0.1)';
                  }}
                  onBlur={(e) => { 
                    e.currentTarget.style.borderColor = 'var(--border-base)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div className="w-full">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full text-lg py-4 font-semibold" 
                  disabled={submitting}
                >
                  {submitting ? (t('contact_submit')?.includes('Gönder') ? 'Gönderiliyor...' : 'Sending...') : t('contact_submit')}
                </Button>
              </div>
            </div>
          </div>
        </motion.form>
      </div>
    </section>
  );
}

