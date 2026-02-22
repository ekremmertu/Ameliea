# 🚀 Stress Test Rehberi

## 📋 Hızlı Başlangıç

### 1. k6 Kurulumu

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D9B
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Doğrulama:**
```bash
k6 version
```

---

## 🧪 Test Senaryoları

### Senaryo 1: Ana Sayfa Stress Testi (2000 Users)

```bash
# Local server için
npm run test:load

# veya custom URL ile
BASE_URL=http://localhost:4173 k6 run tests/load/homepage-stress.js

# Production için
BASE_URL=https://your-domain.com k6 run tests/load/homepage-stress.js
```

**Özellikler:**
- 2000 concurrent virtual users
- 5 dakika süre
- Ana sayfa yükleme
- Static assets yükleme simülasyonu

**Beklenen Sonuçlar:**
- Response time (p95): < 2 saniye
- Error rate: < %1
- Throughput: > 500 req/s

---

### Senaryo 2: API Endpoint Stress Testi (1000 Users)

```bash
npm run test:load:api

# Custom URL ve test slug ile
BASE_URL=http://localhost:4173 TEST_SLUG=demo-invitation k6 run tests/load/api-stress.js
```

**Test Edilen Endpoint'ler:**
- `/api/health` - Health check
- `/api/invitations/[slug]` - Invitation GET
- `/api/rsvp` - RSVP POST
- `/api/invitations/[slug]/guest-questions` - Guest questions GET

**Beklenen Sonuçlar:**
- Response time (p95): < 1 saniye
- Error rate: < %1
- Throughput: > 300 req/s

---

### Senaryo 3: Full Stack Stress Testi (2000 Users)

```bash
npm run test:load:full

# Custom URL ile
BASE_URL=http://localhost:4173 TEST_SLUG=demo-invitation k6 run tests/load/full-stack-stress.js
```

**Kullanıcı Senaryoları:**
- **%70 Visitor:** Sadece ana sayfa + invitation görüntüleme
- **%20 RSVP Submitter:** Ana sayfa + invitation + RSVP gönderme
- **%10 Full Flow:** Login + Dashboard + API calls

**Beklenen Sonuçlar:**
- Response time (p95): < 2 saniye
- Error rate: < %2
- Throughput: > 400 req/s
- En az 100 kullanıcı akışı tamamlanmalı

---

## 📊 Sonuçları Analiz Etme

### Konsol Çıktısı

Test çalıştırıldığında gerçek zamanlı metrikler görünür:

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
  • Medyan (p50): 987.65ms
  • p95: 1,876.54ms
  • p99: 2,345.67ms

Throughput:
  • İstek/Saniye: 523.45

✅ TEST BAŞARILI - Tüm hedefler karşılandı!
```

### JSON Raporu

```bash
# JSON çıktısı al
k6 run --out json=results/stress-test.json tests/load/homepage-stress.js

# Raporu görüntüle
k6 report results/stress-test.json
```

### HTML Raporu (Opsiyonel)

```bash
# HTML raporu oluştur
k6 run --out json=results/stress-test.json tests/load/homepage-stress.js
k6 report --output results/stress-test.html results/stress-test.json
```

---

## ⚙️ Test Parametrelerini Özelleştirme

### Concurrent Users Sayısını Değiştirme

`tests/load/homepage-stress.js` dosyasında:

```javascript
export const options = {
  stages: [
    { duration: '30s', target: 500 },   // 500 kullanıcıya çık
    { duration: '1m', target: 1000 },   // 1000 kullanıcıya çık
    { duration: '2m', target: 2000 },   // 2000 kullanıcıya çık
    { duration: '2m', target: 2000 },   // 2000 kullanıcıyla devam et
    { duration: '1m', target: 0 },      // 0'a düş
  ],
};
```

### Threshold'ları Değiştirme

```javascript
thresholds: {
  http_req_duration: ['p(95)<2000'], // p95 2 saniyeden az
  http_req_failed: ['rate<0.01'],    // Hata oranı %1'den az
},
```

---

## 🎯 Performans Hedefleri

### Ana Sayfa
- **Response Time (p95):** < 2 saniye
- **Error Rate:** < %1
- **Throughput:** > 500 req/s
- **Concurrent Users:** 2000+ desteklemeli

### API Endpoint'leri
- **Response Time (p95):** < 1 saniye
- **Error Rate:** < %1
- **Throughput:** > 300 req/s
- **Concurrent Users:** 1000+ desteklemeli

### Full Stack
- **Response Time (p95):** < 2 saniye
- **Error Rate:** < %2
- **Throughput:** > 400 req/s
- **Concurrent Users:** 2000+ desteklemeli

---

## 🔍 Sorun Giderme

### Yüksek Error Rate

**Olası Nedenler:**
- Server yetersiz kaynak (CPU, Memory)
- Database connection pool yetersiz
- Rate limiting aktif
- Network bottleneck

**Çözümler:**
1. Server kaynaklarını kontrol et
2. Database connection pool'u artır
3. Rate limiting'i geçici olarak kaldır
4. CDN kullan (static assets için)

### Yüksek Response Time

**Olası Nedenler:**
- Yavaş database sorguları
- N+1 query problemi
- Cache eksikliği
- Yetersiz server kaynakları

**Çözümler:**
1. Database index'lerini kontrol et
2. Query'leri optimize et
3. Redis cache ekle
4. Server kaynaklarını artır

### Test Başarısız Oluyor

**Kontrol Listesi:**
- ✅ Server çalışıyor mu? (`npm run dev` veya `npm start`)
- ✅ BASE_URL doğru mu?
- ✅ Test slug mevcut mu? (API testleri için)
- ✅ Database bağlantısı var mı?
- ✅ Rate limiting kapalı mı?

---

## 📝 Notlar

1. **Test Environment:** Testleri production benzeri ortamda çalıştırın
2. **Database:** Test veritabanı kullanın (production DB'yi etkilememeli)
3. **Monitoring:** Test sırasında server metriklerini izleyin (CPU, Memory, Network)
4. **Gradual Increase:** Kullanıcı sayısını kademeli olarak artırın
5. **Baseline:** Önce baseline test yapın (100 users), sonra artırın

---

## 🚀 Production Test Önerileri

1. **Staging Environment'da Test Et:**
   ```bash
   BASE_URL=https://staging.your-domain.com k6 run tests/load/full-stack-stress.js
   ```

2. **Peak Hours'da Test Et:**
   - Gerçek kullanıcı trafiğini simüle eder
   - Production load ile birlikte test eder

3. **Monitoring Tools Kullan:**
   - Server metrics (CPU, Memory, Disk I/O)
   - Database metrics (connection pool, query time)
   - Application metrics (response time, error rate)

4. **Gradual Ramp-up:**
   - Aniden 2000 user'a çıkmayın
   - Kademeli olarak artırın (100 → 500 → 1000 → 2000)

---

**Hazırlayan:** Corvus Quant Architect  
**Tarih:** 2026-01-18

