'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

export function ContactInfo() {
  const { lang } = useI18n();

  const contactInfo = {
    phone: '+90 555 123 4567',
    email: 'info@ameliea.co',
    whatsapp: '+90 555 123 4567',
    social: {
      instagram: 'https://instagram.com/ameliea',
      facebook: 'https://facebook.com/ameliea',
      twitter: 'https://twitter.com/ameliea',
    },
  };

  const contactMethods = [
    {
      icon: '📞',
      title: lang === 'tr' ? 'Telefon' : 'Phone',
      value: contactInfo.phone,
      href: `tel:${contactInfo.phone}`,
      color: 'var(--crimson-base)',
      bgGradient: 'linear-gradient(135deg, rgba(161, 43, 58, 0.1) 0%, rgba(161, 43, 58, 0.05) 100%)',
    },
    {
      icon: '✉️',
      title: lang === 'tr' ? 'E-posta' : 'Email',
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
      color: 'var(--gold-base)',
      bgGradient: 'linear-gradient(135deg, rgba(200, 162, 74, 0.1) 0%, rgba(200, 162, 74, 0.05) 100%)',
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      value: contactInfo.whatsapp,
      href: `https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`,
      color: '#25D366',
      bgGradient: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(37, 211, 102, 0.05) 100%)',
    },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      href: contactInfo.social.instagram,
      icon: '📷',
      color: '#E4405F',
    },
    {
      name: 'Facebook',
      href: contactInfo.social.facebook,
      icon: '👤',
      color: '#1877F2',
    },
    {
      name: 'Twitter',
      href: contactInfo.social.twitter,
      icon: '🐦',
      color: '#1DA1F2',
    },
  ];

  return (
    <section 
      className="py-24 px-4 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      }}
    >
      {/* Premium decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-5" style={{ background: 'var(--gold-base)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-5" style={{ background: 'var(--crimson-base)', filter: 'blur(100px)' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-3" style={{ 
          background: 'radial-gradient(circle, var(--gold-base) 0%, transparent 70%)',
          filter: 'blur(120px)',
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
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

        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.href}
              target={method.href.startsWith('http') ? '_blank' : undefined}
              rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group relative p-8 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--bg-panel-strong)',
                border: '2px solid rgba(200, 162, 74, 0.2)',
                boxShadow: '0 20px 60px rgba(27, 22, 32, 0.1)',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ 
                borderColor: method.color,
                boxShadow: `0 30px 80px ${method.color}20`,
              }}
            >
              {/* Background gradient on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: method.bgGradient }}
              />
              
              {/* Decorative circle */}
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
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-base)' }}>
                  <span className="text-sm" style={{ color: tokens.colors.text.muted }}>
                    {lang === 'tr' ? 'Tıklayarak iletişime geçin' : 'Click to contact'}
                  </span>
                </div>
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
            {lang === 'tr' ? 'Sosyal Medya' : 'Social Media'}
          </h3>
          <p className="text-lg mb-8" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' 
              ? 'Bizi takip edin ve güncel haberlerden haberdar olun'
              : 'Follow us and stay updated with the latest news'}
          </p>
          
          <div className="flex justify-center gap-6">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ 
                  backgroundColor: 'var(--bg-panel-strong)',
                  border: '2px solid rgba(200, 162, 74, 0.2)',
                  boxShadow: '0 10px 30px rgba(27, 22, 32, 0.1)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                whileHover={{ 
                  borderColor: social.color,
                  boxShadow: `0 15px 40px ${social.color}30`,
                  backgroundColor: `${social.color}10`,
                }}
                aria-label={social.name}
              >
                <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                  {social.icon}
                </span>
                {/* Tooltip */}
                <div 
                  className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                >
                  <div 
                    className="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
                    style={{ 
                      backgroundColor: social.color,
                      color: 'white',
                    }}
                  >
                    {social.name}
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
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
