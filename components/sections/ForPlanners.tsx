'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useI18n } from '@/components/providers/I18nProvider';

export function ForPlanners() {
  const { lang } = useI18n();

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)' }}>
      {/* Premium decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-5" style={{ 
          backgroundImage: 'radial-gradient(circle at 20% 50%, var(--gold-base) 0%, transparent 50%), radial-gradient(circle at 80% 80%, var(--crimson-base) 0%, transparent 50%)',
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
              {lang === 'tr' ? 'Profesyoneller İçin' : 'For Professionals'}
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
            {lang === 'tr' ? 'Düğün Planlamacıları İçin' : 'For Wedding Planners'}
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' 
              ? 'Müşterilerinize premium dijital davetiye deneyimi sunun ve işinizi büyütün'
              : 'Offer premium digital invitation experiences to your clients and grow your business'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            className="p-8 rounded-3xl relative overflow-hidden group cursor-pointer"
            style={{ 
              backgroundColor: 'var(--bg-panel-strong)',
              border: '2px solid rgba(200, 162, 74, 0.2)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, borderColor: 'rgba(200, 162, 74, 0.4)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: 'var(--gold-base)' }} />
            <div className="relative">
              <div className="text-5xl mb-6">🤝</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'Ortaklık Programı' : 'Partnership Program'}
              </h3>
              <p className="mb-4 leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' 
                  ? 'Özel fiyatlandırma, cazip komisyon oranları ve öncelikli destek ile işinizi büyütün'
                  : 'Grow your business with special pricing, attractive commission rates, and priority support'}
              </p>
              <ul className="space-y-2 text-sm" style={{ color: tokens.colors.text.muted }}>
                <li>• {lang === 'tr' ? '%30\'a varan komisyon' : 'Up to 30% commission'}</li>
                <li>• {lang === 'tr' ? 'Özel fiyatlandırma' : 'Special pricing'}</li>
                <li>• {lang === 'tr' ? 'Öncelikli destek' : 'Priority support'}</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            className="p-8 rounded-3xl relative overflow-hidden group cursor-pointer"
            style={{ 
              backgroundColor: 'var(--bg-panel-strong)',
              border: '2px solid rgba(200, 162, 74, 0.2)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, borderColor: 'rgba(200, 162, 74, 0.4)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: 'var(--crimson-base)' }} />
            <div className="relative">
              <div className="text-5xl mb-6">🎨</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'Özel Markalama' : 'White Label'}
              </h3>
              <p className="mb-4 leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' 
                  ? 'Kendi markanızla hizmet verin, müşterileriniz sizin markanızı görsün'
                  : 'Offer services under your own brand, let your clients see your branding'}
              </p>
              <ul className="space-y-2 text-sm" style={{ color: tokens.colors.text.muted }}>
                <li>• {lang === 'tr' ? 'Özel logo ve markalama' : 'Custom logo and branding'}</li>
                <li>• {lang === 'tr' ? 'Marka renkleri' : 'Brand colors'}</li>
                <li>• {lang === 'tr' ? 'Özel domain' : 'Custom domain'}</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            className="p-8 rounded-3xl relative overflow-hidden group cursor-pointer"
            style={{ 
              backgroundColor: 'var(--bg-panel-strong)',
              border: '2px solid rgba(200, 162, 74, 0.2)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, borderColor: 'rgba(200, 162, 74, 0.4)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: 'var(--gold-base)' }} />
            <div className="relative">
              <div className="text-5xl mb-6">📊</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                {lang === 'tr' ? 'Yönetim Paneli' : 'Management Dashboard'}
              </h3>
              <p className="mb-4 leading-relaxed" style={{ color: tokens.colors.text.secondary }}>
                {lang === 'tr' 
                  ? 'Tüm müşterilerinizi tek bir panelden yönetin, istatistikleri takip edin'
                  : 'Manage all your clients from one dashboard, track statistics'}
              </p>
              <ul className="space-y-2 text-sm" style={{ color: tokens.colors.text.muted }}>
                <li>• {lang === 'tr' ? 'Merkezi yönetim' : 'Centralized management'}</li>
                <li>• {lang === 'tr' ? 'Detaylı raporlama' : 'Detailed reporting'}</li>
                <li>• {lang === 'tr' ? 'Toplu işlemler' : 'Bulk operations'}</li>
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <a
            href="mailto:partners@ameliea.co"
            className="inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--crimson-base), var(--gold-base))',
              color: 'white',
            }}
          >
            {lang === 'tr' ? 'Ortaklık Başlat' : 'Start Partnership'}
          </a>
          <p className="mt-4 text-sm" style={{ color: tokens.colors.text.muted }}>
            {lang === 'tr' 
              ? 'Özel fiyatlandırma ve komisyon seçenekleri için bizimle iletişime geçin'
              : 'Contact us for special pricing and commission options'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

