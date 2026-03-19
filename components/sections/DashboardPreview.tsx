'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

export function DashboardPreview() {
  const { t, lang } = useI18n();

  const stats = [
    { label: lang === 'tr' ? 'Toplam Yanıt' : 'Total Responses', value: 24, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)', icon: '📋' },
    { label: lang === 'tr' ? 'Onaylı' : 'Confirmed', value: 18, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', icon: '✅' },
    { label: lang === 'tr' ? 'Beklemede' : 'Pending', value: 3, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', icon: '⏳' },
    { label: lang === 'tr' ? 'Reddedildi' : 'Declined', value: 3, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', icon: '❌' },
    { label: lang === 'tr' ? 'Toplam Misafir' : 'Total Guests', value: 42, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)', icon: '👥' },
  ];

  const recentRsvps = [
    { name: 'Ayşe & Mehmet', status: 'attending', guests: 2, time: lang === 'tr' ? '2 saat önce' : '2 hours ago' },
    { name: 'Elif Yılmaz', status: 'attending', guests: 1, time: lang === 'tr' ? '5 saat önce' : '5 hours ago' },
    { name: 'Can Demir', status: 'not attending', guests: 0, time: lang === 'tr' ? '1 gün önce' : '1 day ago' },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-5" style={{ background: 'var(--crimson-base)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full opacity-5" style={{ background: 'var(--gold-base)', filter: 'blur(80px)' }} />
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
              {t('dashboard_badge')}
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
            {t('dashboard_title')}
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
            {t('dashboard_subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div 
            className="rounded-3xl overflow-hidden shadow-2xl border"
            style={{ 
              backgroundColor: 'var(--bg-panel-strong)',
              borderColor: 'rgba(200, 162, 74, 0.2)',
              boxShadow: '0 30px 80px rgba(27, 22, 32, 0.15)',
            }}
          >
            {/* Dashboard Header */}
            <div 
              className="px-8 py-6 border-b"
              style={{ 
                borderColor: 'rgba(200, 162, 74, 0.1)',
                background: 'linear-gradient(135deg, rgba(200, 162, 74, 0.05), rgba(161, 43, 58, 0.05))',
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: 'rgba(200, 162, 74, 0.15)', color: 'var(--gold-base)' }}>
                      {lang === 'tr' ? 'Yönetim Paneli' : 'Dashboard'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                      48 {lang === 'tr' ? 'gün kaldı' : 'days left'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1" style={{ color: tokens.colors.text.primary, fontFamily: tokens.typography.fontFamily.serif.join(', ') }}>
                    Mar & Jaume
                  </h3>
                  <p className="text-sm flex items-center gap-2" style={{ color: tokens.colors.text.muted }}>
                    📍 Grand Ballroom · 📅 {lang === 'tr' ? '15 Haziran 2026' : 'June 15, 2026'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
                    style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-base)', color: tokens.colors.text.primary }}>
                    👁️ {lang === 'tr' ? 'Önizle' : 'Preview'}
                  </div>
                  <div className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                    style={{ backgroundColor: 'var(--crimson-base)', color: 'white' }}>
                    ✏️ {lang === 'tr' ? 'Düzenle' : 'Edit'}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-8">
              {/* Stats Grid — 5 stat cards matching actual dashboard */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="p-5 rounded-2xl relative overflow-hidden"
                    style={{ backgroundColor: stat.bg }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute top-3 right-3 text-2xl opacity-40">{stat.icon}</div>
                    <div className="text-4xl font-black mb-1" style={{ color: stat.color, fontFamily: tokens.typography.fontFamily.serif.join(', ') }}>
                      {stat.value}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: stat.color, opacity: 0.8 }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Share Card */}
              <motion.div
                className="mb-8 p-5 rounded-2xl border"
                style={{ backgroundColor: 'rgba(200, 162, 74, 0.04)', borderColor: 'rgba(200, 162, 74, 0.2)' }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--gold-base)' }}>
                      📤 {lang === 'tr' ? 'Davetiyeyi Paylaş' : 'Share Invitation'}
                    </h4>
                    <p className="text-xs" style={{ color: tokens.colors.text.muted }}>
                      {lang === 'tr' ? 'WhatsApp, SMS veya e-posta ile gönderin' : 'Send via WhatsApp, SMS or email'}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="px-4 py-2.5 rounded-xl border text-xs min-w-[160px]"
                      style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-base)', color: tokens.colors.text.muted }}>
                      ameliea.co/invitation/mar-jaume
                    </div>
                    <div className="px-4 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ backgroundColor: 'var(--crimson-base)', color: 'white' }}>
                      🔗 {lang === 'tr' ? 'Kopyala' : 'Copy'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent RSVPs */}
              <div>
                <h4 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? 'Son Yanıtlar' : 'Recent Responses'}
                </h4>
                <div className="space-y-3">
                  {recentRsvps.map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="p-4 rounded-xl flex items-center justify-between"
                      style={{ backgroundColor: 'var(--bg-panel)' }}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{ 
                            backgroundColor: item.status === 'attending' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: item.status === 'attending' ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {item.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: tokens.colors.text.primary }}>
                            {item.name}
                          </div>
                          <div className="text-xs" style={{ color: tokens.colors.text.muted }}>
                            {item.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.status === 'attending' && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ 
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e',
                          }}>
                            {item.guests} {lang === 'tr' ? 'misafir' : 'guests'}
                          </span>
                        )}
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: item.status === 'attending' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: item.status === 'attending' ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {item.status === 'attending' ? (lang === 'tr' ? 'Katılacak' : 'Attending') : (lang === 'tr' ? 'Katılmayacak' : 'Not Attending')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm" style={{ color: tokens.colors.text.muted }}>
            {t('dashboard_footer')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
