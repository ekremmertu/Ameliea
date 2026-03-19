'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export function ContactInfo() {
  const { lang } = useI18n();

  const contactMethods = [
    {
      icon: <MailIcon />,
      title: 'E-posta',
      value: 'amelieadestek@gmail.com',
      href: 'mailto:amelieadestek@gmail.com',
      color: 'var(--gold-base)',
      bgGradient: 'linear-gradient(135deg, rgba(200, 162, 74, 0.1) 0%, rgba(200, 162, 74, 0.05) 100%)',
    },
    {
      icon: <WhatsAppIcon />,
      title: 'WhatsApp',
      value: lang === 'tr' ? 'Yakında' : 'Coming soon',
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

        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.disabled ? undefined : method.href}
              target={method.href.startsWith('http') ? '_blank' : undefined}
              rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
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
                  className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl transform group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${method.color}15`, color: method.color }}
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
                    <span className="text-sm italic" style={{ color: tokens.colors.text.muted }}>
                      {lang === 'tr' ? 'Çok yakında aktif olacak' : 'Will be active very soon'}
                    </span>
                  </div>
                )}
              </div>
            </motion.a>
          ))}
        </div>

        {/* Social Media Section */}
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
              ? 'İlham veren içerikler, yeni temalar ve özel duyurular için'
              : 'For inspiring content, new themes and special announcements'}
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
                boxShadow: '0 10px 30px rgba(27, 22, 32, 0.1)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ 
                borderColor: '#E4405F',
                boxShadow: '0 20px 50px rgba(228, 64, 95, 0.15)',
              }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
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
              <div className="ml-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.colors.text.muted }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
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
