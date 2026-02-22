'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/I18nProvider';
import { tokens } from '@/lib/design-tokens';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';
import { ScheduleTimeline } from '@/components/invitation/ScheduleTimeline';
import { ImageSlider } from '@/components/ui/ImageSlider';

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
  const { lang } = useI18n();

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

  // Demo venue photos: 2 kır düğünü (İtalya - Tuscany) + 1 kapalı salon
  // İtalya kır düğünü görselleri: Tuscany bağları, villa, açık alan düğün yeri
  const demoVenuePhotos = [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', // Kır düğünü 1 - Tuscany bağlarında düğün (vineyard wedding)
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80', // Kır düğünü 2 - Tuscany villa açık alan düğün yeri (outdoor wedding)
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', // Kapalı salon - İç mekan (ballroom/wedding hall)
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
            {lang === 'tr' ? 'Her Detay, Sizin Hikayenizden' : 'Every Detail, From Your Story'}
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto" style={{ color: tokens.colors.text.secondary }}>
            {lang === 'tr' 
              ? 'Davetiyenizde sunabileceğiniz tüm özellikler'
              : 'All the features you can offer in your invitation'}
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
                    ? 'Düğün tarihine kalan süreyi canlı olarak gösterin. Misafirleriniz heyecanla bekleyecek.'
                    : 'Show the time remaining until your wedding date in real-time. Your guests will wait with excitement.'}
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
                    ? 'Günün programını görsel bir zaman çizelgesi ile sunun. Her etkinlik için özel ikonlar ve açıklamalar ekleyin.'
                    : 'Present the day\'s schedule with a visual timeline. Add custom icons and descriptions for each event.'}
                </p>
              </div>
              <div className="order-1 md:order-2">
                <ScheduleTimeline
                  scheduleItems={demoScheduleItems}
                />
              </div>
            </div>
          </motion.div>

          {/* Venue Photos Slider Feature */}
          <motion.div variants={itemVariants} className="p-8 rounded-3xl" style={{ backgroundColor: 'var(--bg-panel-strong)' }}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4" style={{ color: tokens.colors.text.primary }}>
                  {lang === 'tr' ? '📸 Mekan Fotoğrafları' : '📸 Venue Photos'}
                </h3>
                <p className="text-lg mb-6" style={{ color: tokens.colors.text.secondary }}>
                  {lang === 'tr' 
                    ? 'Mekanınızın en güzel fotoğraflarını ekleyin. Slider ile misafirlerinize mekanı tanıtın.'
                    : 'Add the most beautiful photos of your venue. Introduce your venue to guests with a slider.'}
                </p>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <ImageSlider images={demoVenuePhotos} />
                </div>
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
                    ? 'Mekan adresinizi ekleyin, misafirleriniz haritada görebilsin ve tek tıkla navigasyon başlatabilsin.'
                    : 'Add your venue address, let your guests see it on the map and start navigation with one click.'}
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
                    ? 'Misafirlerinizin sık sorduğu soruları önceden cevaplayın. Dress code, park yeri, çocuk kabulü gibi detayları ekleyin.'
                    : 'Answer frequently asked questions in advance. Add details like dress code, parking, children acceptance.'}
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
                    ? 'Misafirlerinize özel sorular sorun ve cevaplarını alın. Menü tercihleri, +1 bilgisi, özel notlar gibi.'
                    : 'Ask custom questions to your guests and get their answers. Menu preferences, +1 information, special notes, etc.'}
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

