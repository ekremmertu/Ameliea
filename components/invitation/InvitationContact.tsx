'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

interface InvitationContactProps {
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsApp?: string;
  themeColor: string;
}

export function InvitationContact({ contactPhone, contactEmail, contactWhatsApp, themeColor }: InvitationContactProps) {
  const { lang } = useI18n();

  if (!contactPhone && !contactEmail && !contactWhatsApp) return null;

  return (
    <section className="py-20 px-4" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {lang === 'tr' ? 'İletişim' : 'Contact'}
          </h2>
          <p className="text-lg" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' ? 'Sorularınız için bizimle iletişime geçin' : 'Get in touch with us for any questions'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {contactPhone && (
            <motion.a
              href={`tel:${contactPhone}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl text-center transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                border: `2px solid ${themeColor}`,
              }}
            >
              <div className="text-4xl mb-4">📞</div>
              <h3 className="font-semibold mb-2" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'Telefon' : 'Phone'}
              </h3>
              <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                {contactPhone}
              </p>
            </motion.a>
          )}

          {contactEmail && (
            <motion.a
              href={`mailto:${contactEmail}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl text-center transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                border: `2px solid ${themeColor}`,
              }}
            >
              <div className="text-4xl mb-4">✉️</div>
              <h3 className="font-semibold mb-2" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'E-posta' : 'Email'}
              </h3>
              <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                {contactEmail}
              </p>
            </motion.a>
          )}

          {contactWhatsApp && (
            <motion.a
              href={`https://wa.me/${contactWhatsApp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl text-center transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-panel-strong)',
                border: `2px solid ${themeColor}`,
              }}
            >
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-semibold mb-2" style={{ color: tokens.colors.text.primary }}>
                WhatsApp
              </h3>
              <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                {contactWhatsApp}
              </p>
            </motion.a>
          )}
        </div>
      </div>
    </section>
  );
}

