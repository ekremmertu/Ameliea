'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

export function DashboardPreview() {
  const { lang } = useI18n();

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
              {lang === 'tr' ? 'Premium Özellik' : 'Premium Feature'}
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
            {lang === 'tr' ? 'Davetiye Yönetim Paneli' : 'Invitation Dashboard'}
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' 
              ? 'RSVP yanıtlarınızı gerçek zamanlı takip edin, detaylı istatistikleri görüntüleyin ve davetiyenizi profesyonelce yönetin'
              : 'Track your RSVP responses in real-time, view detailed statistics, and manage your invitation professionally'}
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
              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <motion.div
                  className="p-6 rounded-2xl relative overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid rgba(200, 162, 74, 0.1)',
                  }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(200, 162, 74, 0.3)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5" style={{ background: 'var(--gold-base)' }} />
                  <div className="relative">
                    <div className="text-4xl font-bold mb-2" style={{ color: tokens.colors.text.primary }}>
                      24
                    </div>
                    <div className="text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                      {lang === 'tr' ? 'Toplam Yanıt' : 'Total Responses'}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: tokens.colors.text.muted }}>
                      +3 bu hafta
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl relative overflow-hidden"
                  style={{ 
                    backgroundColor: 'rgba(161, 43, 58, 0.05)',
                    border: '1px solid rgba(161, 43, 58, 0.2)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10" style={{ background: 'var(--crimson-base)' }} />
                  <div className="relative">
                    <div className="text-4xl font-bold mb-2" style={{ color: 'var(--crimson-base)' }}>
                      18
                    </div>
                    <div className="text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                      {lang === 'tr' ? 'Katılacak' : 'Attending'}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: 'var(--crimson-base)' }}>
                      75% katılım oranı
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl relative overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid rgba(27, 22, 32, 0.1)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5" style={{ background: 'var(--ink-base)' }} />
                  <div className="relative">
                    <div className="text-4xl font-bold mb-2" style={{ color: 'var(--ink-base)' }}>
                      6
                    </div>
                    <div className="text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                      {lang === 'tr' ? 'Katılmayacak' : 'Not Attending'}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: tokens.colors.text.muted }}>
                      25% oran
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl relative overflow-hidden"
                  style={{ 
                    backgroundColor: 'rgba(200, 162, 74, 0.05)',
                    border: '1px solid rgba(200, 162, 74, 0.2)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10" style={{ background: 'var(--gold-base)' }} />
                  <div className="relative">
                    <div className="text-4xl font-bold mb-2" style={{ color: 'var(--gold-base)' }}>
                      42
                    </div>
                    <div className="text-sm font-medium" style={{ color: tokens.colors.text.secondary }}>
                      {lang === 'tr' ? 'Toplam Misafir' : 'Total Guests'}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: 'var(--gold-base)' }}>
                      Ortalama 1.75/kişi
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent RSVPs Preview */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? 'Son Yanıtlar' : 'Recent Responses'}
                </h4>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Johnson', status: 'attending', guests: 2, time: '2 saat önce' },
                    { name: 'Michael Chen', status: 'attending', guests: 1, time: '5 saat önce' },
                    { name: 'Emma Williams', status: 'not attending', guests: 0, time: '1 gün önce' },
                  ].map((item, idx) => (
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
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{ 
                            backgroundColor: item.status === 'attending' ? 'rgba(161, 43, 58, 0.1)' : 'rgba(27, 22, 32, 0.1)',
                            color: item.status === 'attending' ? 'var(--crimson-base)' : 'var(--ink-base)',
                          }}
                        >
                          {item.name.split(' ').map(n => n[0]).join('')}
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
                            backgroundColor: 'rgba(161, 43, 58, 0.1)',
                            color: 'var(--crimson-base)',
                          }}>
                            {item.guests} {lang === 'tr' ? 'misafir' : 'guests'}
                          </span>
                        )}
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: item.status === 'attending' ? 'rgba(161, 43, 58, 0.1)' : 'rgba(27, 22, 32, 0.1)',
                            color: item.status === 'attending' ? 'var(--crimson-base)' : 'var(--ink-base)',
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
          <p className="text-lg mb-2" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' 
              ? 'Davetiyenizi oluşturduktan sonra özel yönetim paneline erişebilirsiniz'
              : 'After creating your invitation, you\'ll have access to a private dashboard'}
          </p>
          <p className="text-sm" style={{ color: tokens.colors.text.muted }}>
            {lang === 'tr' 
              ? 'Gerçek zamanlı güncellemeler • Detaylı analitik • Profesyonel yönetim'
              : 'Real-time updates • Detailed analytics • Professional management'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

