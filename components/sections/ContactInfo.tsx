'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

const InstagramIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

export function ContactInfo() {
  const { lang } = useI18n();

  const contactMethods = [
    {
      icon: '✉️',
      title: lang === 'tr' ? 'E-posta' : 'Email',
      value: 'amelieadestek@gmail.com',
      href: 'mailto:amelieadestek@gmail.com',
      color: 'var(--gold-base)',
      bgGradient: 'linear-gradient(135deg, rgba(200, 162, 74, 0.1) 0%, rgba(200, 162, 74, 0.05) 100%)',
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      value: '-',
      href: '#',
      color: '#25D366',
      bgGradient: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(37, 211, 102, 0.05) 100%)',
      disabled: true,
    },
  ];

  return (
    <section 
      className="py-24 px-4 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-5" style={{ background: 'var(--gold-base)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-5" style={{ background: 'var(--crimson-base)', filter: 'blur(100px)' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-3" style={{ 
          background: 'radial-gradient(circle, var(--gold-base) 0%, transparent 70%)',
          filter: 'blur(120px)',
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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
              {lang === 'tr' ? 'Bizimle İletişime Geçin' : 'Get In Touch'}
            </span>
          </div>
          <h2
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
              letterSpacing: '-0.02em',
            }}
          >
            {lang === 'tr' ? 'İletişim' : 'Contact Us'}
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' 
              ? 'Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız. Bize ulaşın ve unutulmaz bir deneyim için birlikte çalışalım.'
              : 'Have questions? We\'d be happy to help. Reach out to us and let\'s work together for an unforgettable experience.'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.disabled ? undefined : method.href}
              target={!method.disabled && method.href.startsWith('http') ? '_blank' : undefined}
              rel={!method.disabled && method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`group relative p-8 rounded-3xl overflow-hidden transition-all duration-300 ${method.disabled ? 'cursor-default opacity-60' : 'hover:scale-105 cursor-pointer'}`}
              style={{ 
                backgroundColor: 'var(--bg-panel-strong)',
                border: '2px solid rgba(200, 162, 74, 0.2)',
                boxShadow: '0 20px 60px rgba(27, 22, 32, 0.1)',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={method.disabled ? undefined : { 
                borderColor: method.color,
                boxShadow: `0 30px 80px ${method.color}20`,
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: method.bgGradient }}
              />
              <div 
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                style={{ background: method.color, filter: 'blur(40px)' }}
              />
              <div className="relative z-10 text-center">
                <div 
                  className="text-5xl mb-6 inline-block transform group-hover:scale-110 transition-transform duration-300"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                >
                  {method.icon}
                </div>
                <h3 
                  className="text-2xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300"
                  style={{ color: tokens.colors.text.primary }}
                >
                  {method.title}
                </h3>
                <p 
                  className="text-base font-medium"
                  style={{ color: method.color }}
                >
                  {method.value}
                </p>
                {!method.disabled && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-base)' }}>
                    <span className="text-sm" style={{ color: tokens.colors.text.muted }}>
                      {lang === 'tr' ? 'Tıklayarak iletişime geçin' : 'Click to contact'}
                    </span>
                  </div>
                )}
                {method.disabled && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-base)' }}>
                    <span className="text-sm" style={{ color: tokens.colors.text.muted }}>
                      {lang === 'tr' ? 'Yakında' : 'Coming soon'}
                    </span>
                  </div>
                )}
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 
            className="text-2xl font-bold mb-6"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {lang === 'tr' ? 'Bizi Takip Edin' : 'Follow Us'}
          </h3>
          <p className="text-lg mb-8" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' 
              ? 'İlham veren içerikler, güncellemeler ve daha fazlası için'
              : 'For inspiring content, updates and more'}
          </p>
          
          <div className="flex justify-center">
            <motion.a
              href="https://instagram.com/Ameliea.co"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-4 px-8 py-5 rounded-2xl transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--bg-panel-strong)',
                border: '2px solid rgba(200, 162, 74, 0.2)',
                boxShadow: '0 15px 40px rgba(27, 22, 32, 0.1)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ 
                borderColor: '#E4405F',
                boxShadow: '0 20px 60px rgba(228, 64, 95, 0.2)',
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(228, 64, 95, 0.08) 0%, rgba(252, 175, 69, 0.05) 100%)' }}
              />
              <div className="relative z-10 flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    background: 'linear-gradient(135deg, #833AB4, #E4405F, #FCAF45)',
                    color: 'white',
                  }}
                >
                  <InstagramIcon />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold" style={{ color: tokens.colors.text.primary }}>
                    @Ameliea.co
                  </p>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    Instagram
                  </p>
                </div>
                <div className="ml-4 text-lg transition-transform duration-300 group-hover:translate-x-1" style={{ color: tokens.colors.text.muted }}>
                  →
                </div>
              </div>
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl" style={{ 
            backgroundColor: 'var(--bg-panel-strong)',
            border: '1px solid rgba(200, 162, 74, 0.2)',
          }}>
            <span className="text-2xl">⏰</span>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'Çalışma Saatleri' : 'Working Hours'}
              </p>
              <p className="text-xs" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' ? 'Pazartesi - Cuma: 09:00 - 18:00' : 'Monday - Friday: 9:00 AM - 6:00 PM'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
