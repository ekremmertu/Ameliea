'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';
import { ScheduleTimeline } from '@/components/invitation/ScheduleTimeline';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export function Features() {
  const { t, lang } = useI18n();

  // Demo data for showcase - Tanıtım için sabit 3 gün geri sayım
  // Her zaman 3 gün göster, eğer 2 güne düşerse tekrar 3 güne çıkar
  const demoWeddingDate = new Date();
  demoWeddingDate.setDate(demoWeddingDate.getDate() + 3); // 3 gün sonra
  const demoWeddingDateStr = demoWeddingDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  const demoWeddingTime = '16:00';

  const demoScheduleItems = [
    { time: '14:00', event: lang === 'tr' ? 'Tören' : 'Ceremony', description: lang === 'tr' ? 'Nikah töreni' : 'Wedding ceremony', icon: '⛪' },
    { time: '15:30', event: lang === 'tr' ? 'Kokteyl' : 'Cocktail', description: lang === 'tr' ? 'Kokteyl saati' : 'Cocktail hour', icon: '🍷' },
    { time: '17:00', event: lang === 'tr' ? 'Yemek' : 'Dinner', description: lang === 'tr' ? 'Akşam yemeği' : 'Evening dinner', icon: '🍽️' },
    { time: '20:00', event: lang === 'tr' ? 'Dans' : 'Party', description: lang === 'tr' ? 'Dans ve eğlence' : 'Dancing and celebration', icon: '🎵' },
  ];

  return (
    <section id="features" className="py-24 px-4" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{
              fontFamily: tokens.typography.fontFamily.serif.join(', '),
              color: tokens.colors.text.primary,
            }}
          >
            {t('features_title')}
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto" style={{ color: tokens.colors.text.secondary }}>
            {t('features_subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-16"
        >
          {/* Countdown Timer Feature - Premium */}
          <motion.div variants={itemVariants} className="p-8 rounded-3xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-3xl font-bold" style={{ color: tokens.colors.text.primary }}>
                    {lang === 'tr' ? '⏰ Geri Sayım Sayacı' : '⏰ Countdown Timer'}
                  </h3>
                  <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ 
                    backgroundColor: 'rgba(200, 162, 74, 0.1)',
                    color: 'var(--gold-base)',
                  }}>
                    ⭐ {lang === 'tr' ? 'Premium Özellik' : 'Premium Feature'}
                  </span>
                </div>
                <p className="text-lg mb-6" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' 
                    ? 'Misafirlerinizde heyecan ve beklenti yaratın. Her saniye, gününüze olan özlemi büyütür.'
                    : 'Build excitement and anticipation with your guests. Every second grows their longing for your day.'}
                </p>
              </div>
              <div className="flex justify-center">
                <CountdownTimer
                  weddingDate={demoWeddingDateStr}
                  weddingTime={demoWeddingTime}
                  themeColor="var(--crimson-base)"
                  minDays={3}
                />
              </div>
            </div>
          </motion.div>

          {/* Schedule Timeline Feature */}
          <motion.div variants={itemVariants} className="p-8 rounded-3xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? '📅 Program Zaman Çizelgesi' : '📅 Schedule Timeline'}
                </h3>
                <p className="text-lg mb-6" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' 
                    ? 'Misafirleriniz her an nerede olacaklarını bilsin. Sorular azalsın, keyif artsın.'
                    : 'Your guests know exactly where to be and when. Fewer questions, more joy.'}
                </p>
              </div>
              <div className="order-1 md:order-2">
                <ScheduleTimeline
                  scheduleItems={demoScheduleItems}
                />
              </div>
            </div>
          </motion.div>

          {/* Google Maps Integration Feature */}
          <motion.div variants={itemVariants} className="p-8 rounded-3xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? '🗺️ Google Maps Entegrasyonu' : '🗺️ Google Maps Integration'}
                </h3>
                <p className="text-lg mb-6" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' 
                    ? '"Mekan neredeydi?" sorusunu bir daha duymayın. Tek tıkla navigasyon, sıfır karışıklık.'
                    : 'Never hear "where was the venue?" again. One-tap navigation, zero confusion.'}
                </p>
              </div>
              <div className="order-1 md:order-2">
                <div className="w-full h-64 rounded-xl overflow-hidden relative bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-lg font-semibold" style={{ color: tokens.colors.text.primary }}>
                      {lang === 'tr' ? 'Google Maps Entegrasyonu' : 'Google Maps Integration'}
                    </p>
                    <p className="text-sm mt-2" style={{ color: tokens.colors.text.secondary }}>
                      {lang === 'tr' ? 'Mekanınız haritada görüntülenecek' : 'Your venue will be displayed on the map'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>


          {/* FAQ Feature */}
          <motion.div variants={itemVariants} className="p-8 rounded-3xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? '❓ Sık Sorulan Sorular' : '❓ Frequently Asked Questions'}
                </h3>
                <p className="text-lg mb-6" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' 
                    ? 'Dress code, park yeri, çocuk kabulü... Tekrar tekrar aynı soruları cevaplamak yerine, her şeyi bir kerede anlatın.'
                    : 'Dress code, parking, kids... Instead of answering the same questions over and over, share everything at once.'}
                </p>
              </div>
              <div className="order-1 md:order-2">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-panel)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: tokens.colors.text.primary }}>
                      {lang === 'tr' ? 'Dress code nedir?' : 'What is the dress code?'}
                    </h4>
                    <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                      {lang === 'tr' ? 'Formal kıyafet tercih edilir.' : 'Formal attire is preferred.'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-panel)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: tokens.colors.text.primary }}>
                      {lang === 'tr' ? 'Park yeri var mı?' : 'Is there parking available?'}
                    </h4>
                    <p className="text-sm" style={{ color: tokens.colors.text.secondary }}>
                      {lang === 'tr' ? 'Evet, ücretsiz park yeri mevcuttur.' : 'Yes, free parking is available.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Guest Questions Feature */}
          <motion.div variants={itemVariants} className="p-8 rounded-3xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? '💬 Misafir Soruları' : '💬 Guest Questions'}
                </h3>
                <p className="text-lg mb-6" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' 
                    ? 'Menü tercihi, alerji, +1 bilgisi... Her misafirin ihtiyacını önceden bilin, sürprizlere yer bırakmayın.'
                    : 'Menu preference, allergies, plus-ones... Know every guest\'s needs in advance, leave nothing to chance.'}
                </p>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(200, 162, 74, 0.1)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--gold-base)' }}>
                    ⭐ {lang === 'tr' ? 'Premium Özellik' : 'Premium Feature'}
                  </span>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-md p-8 rounded-xl" style={{ backgroundColor: 'var(--bg-panel)' }}>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-base)' }}>
                      <p className="text-sm font-medium mb-2" style={{ color: tokens.colors.text.primary }}>
                        {lang === 'tr' ? 'Menü tercihiniz nedir?' : 'What is your menu preference?'}
                      </p>
                      <p className="text-xs" style={{ color: tokens.colors.text.secondary }}>
                        {lang === 'tr' ? 'Et / Balık / Vejetaryen' : 'Meat / Fish / Vegetarian'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-base)' }}>
                      <p className="text-sm font-medium mb-2" style={{ color: tokens.colors.text.primary }}>
                        {lang === 'tr' ? 'Özel notlarınız var mı?' : 'Do you have any special notes?'}
                      </p>
                      <p className="text-xs" style={{ color: tokens.colors.text.secondary }}>
                        {lang === 'tr' ? 'Alerji, diyet vb.' : 'Allergies, diet, etc.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

