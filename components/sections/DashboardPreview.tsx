'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

export function DashboardPreview() {
  const { t, lang } = useI18n();

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      {/* Decorative background elements */}
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

        {/* Premium Dashboard Preview */}
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? 'Mar & Jaume' : 'Mar & Jaume'}
                  </h3>
                  <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                    {lang === 'tr' ? 'Düğün Davetiyesi' : 'Wedding Invitation'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-full text-sm font-medium" style={{ 
                    backgroundColor: 'rgba(161, 43, 58, 0.1)',
                    color: 'var(--crimson-base)',
                  }}>
                    {lang === 'tr' ? 'Aktif' : 'Active'}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-8">
              {/* Stats Grid — matches real dashboard layout */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { label: lang === 'tr' ? 'Toplam Yanıt' : 'Total Responses', value: 24, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)', icon: '📋' },
                  { label: lang === 'tr' ? 'Onaylı' : 'Confirmed', value: 18, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', icon: '✅' },
                  { label: lang === 'tr' ? 'Beklemede' : 'Pending', value: 2, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', icon: '⏳' },
                  { label: lang === 'tr' ? 'Reddedildi' : 'Declined', value: 4, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', icon: '❌' },
                  { label: lang === 'tr' ? 'Toplam Misafir' : 'Total Guests', value: 42, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)', icon: '👥' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="p-5 rounded-2xl relative overflow-hidden"
                    style={{ backgroundColor: stat.bg }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
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

              {/* Recent Activity */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? 'Son Aktiviteler' : 'Recent Activity'}
                </h4>
                <div className="space-y-3">
                  {[
                    { name: 'Ayşe Yılmaz', status: 'attending' as const, guests: 2, time: lang === 'tr' ? '2 saat önce' : '2 hours ago', icon: '✅' },
                    { name: 'Mehmet Kaya', status: 'attending' as const, guests: 1, time: lang === 'tr' ? '5 saat önce' : '5 hours ago', icon: '✅' },
                    { name: 'Elif Demir', status: 'not attending' as const, guests: 0, time: lang === 'tr' ? '1 gün önce' : '1 day ago', icon: '❌' },
                  ].map((item, idx) => {
                    const statusConfig = item.status === 'attending'
                      ? { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', label: lang === 'tr' ? 'Katılacak' : 'Attending' }
                      : { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', label: lang === 'tr' ? 'Katılmayacak' : 'Not Attending' };
                    return (
                      <motion.div
                        key={idx}
                        className="p-4 rounded-xl flex items-center justify-between"
                        style={{ backgroundColor: 'var(--bg-panel)' }}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold"
                            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>{item.name}</span>
                              <span className="text-xs" style={{ color: statusConfig.color }}>
                                {item.status === 'attending'
                                  ? `${statusConfig.label} (${item.guests} ${lang === 'tr' ? 'kişi' : 'guests'})`
                                  : statusConfig.label}
                              </span>
                            </div>
                            <span className="text-xs" style={{ color: tokens.colors.text.muted }}>{item.time}</span>
                          </div>
                        </div>
                        <span className="text-lg">{item.icon}</span>
                      </motion.div>
                    );
                  })}
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

