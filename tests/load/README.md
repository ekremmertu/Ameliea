# 🚀 Load Testing (Stress Testing) - k6

Bu klasör k6 kullanarak yük testleri içerir.

## 📦 Kurulum

### macOS
```bash
brew install k6
```

### Linux
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D9B
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Windows
```powershell
# Chocolatey
choco install k6

# veya Scoop
scoop install k6
```

### Doğrulama
```bash
k6 version
```

---

## 🧪 Test Senaryoları

### 1. Ana Sayfa Stress Testi
```bash
k6 run tests/load/homepage-stress.js
```

**Özellikler:**
- 2000 concurrent virtual users
- 5 dakika süre
- Ana sayfa yükleme testi

### 2. API Endpoint Stress Testi
```bash
k6 run tests/load/api-stress.js
```

**Özellikler:**
- Health check
- Invitations API
- RSVP API
- 1000 concurrent users

### 3. Login/Register Stress Testi
```bash
k6 run tests/load/auth-stress.js
```

**Özellikler:**
- Login form submissions
- Register form submissions
- 500 concurrent users

### 4. Full Stack Stress Testi
```bash
k6 run tests/load/full-stack-stress.js
```

**Özellikler:**
- Tüm endpoint'leri test eder
- Gerçekçi kullanıcı akışı
- 2000 concurrent users

---

## 📊 Sonuçları Görüntüleme

### Konsol Çıktısı
Test çalıştırıldığında konsolda gerçek zamanlı metrikler görünür:
- Request rate (req/s)
- Response time (p50, p95, p99)
- Error rate (%)
- Data transfer

### HTML Raporu
```bash
k6 run --out json=results.json tests/load/homepage-stress.js
k6 report results.json
```

### Cloud Raporu (Opsiyonel)
```bash
k6 cloud tests/load/homepage-stress.js
```

---

## ⚙️ Konfigürasyon

Test dosyalarında şu parametreleri değiştirebilirsiniz:

```javascript
export const options = {
  stages: [
    { duration: '30s', target: 500 },   // 30 saniyede 500 kullanıcıya çık
    { duration: '1m', target: 1000 },  // 1 dakikada 1000 kullanıcıya çık
    { duration: '2m', target: 2000 },   // 2 dakikada 2000 kullanıcıya çık
    { duration: '2m', target: 2000 },  // 2 dakika 2000 kullanıcıyla devam et
    { duration: '1m', target: 0 },      // 1 dakikada 0'a düş
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // %95'i 2 saniyeden az olmalı
    http_req_failed: ['rate<0.01'],    // Hata oranı %1'den az olmalı
  },
};
```

---

## 🎯 Hedefler

### Performans Hedefleri
- **Response Time (p95):** < 2 saniye
- **Error Rate:** < %1
- **Throughput:** > 1000 req/s
- **Concurrent Users:** 2000+ desteklemeli

### Test Senaryoları
1. ✅ Ana sayfa yükleme (2000 users)
2. ✅ API endpoint'leri (1000 users)
3. ✅ Login/Register (500 users)
4. ✅ Full stack (2000 users)

---

## 📝 Notlar

1. **Test Environment:** Testler production benzeri ortamda çalıştırılmalı
2. **Database:** Test veritabanı kullanılmalı (production DB'yi etkilememeli)
3. **Rate Limiting:** API rate limiting test edilmeli
4. **Monitoring:** Test sırasında server metrikleri izlenmeli

---

**Hazırlayan:** Corvus Quant Architect  
**Tarih:** 2026-01-18

