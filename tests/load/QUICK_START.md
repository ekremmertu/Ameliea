# ⚡ Stress Test Hızlı Başlangıç

## 🚀 3 Adımda Test Et

### 1. k6 Kurulumu

**macOS:**
```bash
brew install k6
```

**Kurulumu Doğrula:**
```bash
k6 version
```

---

### 2. Server'ı Başlat

```bash
cd repo/web-next
npm run dev
# veya production build için:
npm run build && npm start
```

Server'ın `http://localhost:4173` adresinde çalıştığından emin olun.

---

### 3. Test Çalıştır

#### Ana Sayfa Stress Testi (2000 Users)
```bash
npm run test:load
```

#### API Stress Testi (1000 Users)
```bash
npm run test:load:api
```

#### Full Stack Stress Testi (2000 Users)
```bash
npm run test:load:full
```

#### Tüm Testler
```bash
npm run test:load:all
```

---

## 📊 Sonuçları Görüntüle

Test çalıştırıldığında konsolda gerçek zamanlı metrikler görünür:

```
✓ Ana Sayfa Stress Testi Tamamlandı
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HTTP Metrikleri:
  • Toplam İstek: 125,432
  • Başarılı: 124,178
  • Başarısız: 1,254
  • Hata Oranı: 1.00%

Yanıt Süreleri:
  • Ortalama: 1,234.56ms
  • p95: 1,876.54ms
  • p99: 2,345.67ms

Throughput:
  • İstek/Saniye: 523.45

✅ TEST BAŞARILI - Tüm hedefler karşılandı!
```

---

## 🎯 Beklenen Sonuçlar

### ✅ Başarılı Test
- Response time (p95): < 2 saniye
- Error rate: < %1
- Throughput: > 500 req/s

### ⚠️ Uyarılar
- Response time (p95): 2-5 saniye → Optimizasyon gerekli
- Error rate: %1-5 → Rate limiting veya kaynak sorunu
- Throughput: < 500 req/s → Server kaynakları yetersiz

---

## 🔧 Custom URL ile Test

```bash
# Production URL ile test
BASE_URL=https://your-domain.com k6 run tests/load/homepage-stress.js

# Staging URL ile test
BASE_URL=https://staging.your-domain.com k6 run tests/load/homepage-stress.js
```

---

## 📝 Notlar

1. **İlk Test:** Küçük başlayın (100 users), sonra artırın
2. **Server Monitoring:** Test sırasında CPU/Memory kullanımını izleyin
3. **Database:** Test veritabanı kullanın (production'ı etkilememeli)
4. **Rate Limiting:** Test sırasında geçici olarak kapatın

---

**Detaylı Rehber:** `STRESS_TEST_GUIDE.md` dosyasına bakın.

