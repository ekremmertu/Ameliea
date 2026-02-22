# 💳 Iyzico Ödeme Entegrasyonu

**Tarih:** 2026-01-18  
**Durum:** ✅ **TAMAMLANDI**

---

## 📋 Özet

Iyzico ödeme altyapısı başarıyla entegre edildi. Sistem şu özelliklere sahip:

- ✅ 3D Secure desteği
- ✅ Test ve Production ortam desteği
- ✅ Güvenli kart bilgisi işleme
- ✅ Ödeme durumu takibi
- ✅ Otomatik purchase kaydı oluşturma
- ✅ Başarılı/başarısız ödeme yönlendirmeleri

---

## 🔧 Kurulum

### 1. Environment Variables

`.env.local` dosyasına aşağıdaki değişkenleri ekleyin:

```bash
# Iyzico Payment Gateway
IYZICO_API_KEY=your_api_key_here
IYZICO_SECRET_KEY=your_secret_key_here
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com  # Test için
# Production: https://api.iyzipay.com
```

### 2. Test Kartları (Sandbox)

Iyzico sandbox ortamında test için kullanabileceğiniz kartlar:

**Başarılı Ödeme:**
- Kart No: `5528 7900 0000 0008`
- Son Kullanma: `12/30`
- CVC: `123`
- İsim: Herhangi bir isim

**Başarısız Ödeme:**
- Kart No: `5528 7900 0000 0009`
- Son Kullanma: `12/30`
- CVC: `123`

---

## 🏗️ Mimari

### Dosya Yapısı

```
repo/web-next/
├── lib/
│   ├── iyzico.ts              # Iyzico helper functions
│   └── env.ts                 # Environment variables (Iyzico keys eklendi)
├── types/
│   └── iyzipay.d.ts          # TypeScript type definitions
├── app/
│   ├── api/
│   │   └── payments/
│   │       ├── initialize/
│   │       │   └── route.ts  # Ödeme başlatma API
│   │       └── callback/
│   │           └── route.ts  # 3D Secure callback handler
│   ├── checkout/
│   │   └── page.tsx          # Checkout sayfası (güncellendi)
│   └── payment/
│       ├── success/
│       │   └── page.tsx      # Başarılı ödeme sayfası
│       └── failure/
│           └── page.tsx      # Başarısız ödeme sayfası
└── components/
    └── payment/
        └── PaymentForm.tsx   # Ödeme formu component'i
```

---

## 🔄 Ödeme Akışı

### 1. Kullanıcı Checkout Sayfasına Gelir
- Plan seçimi (Light veya Premium)
- Kullanıcı giriş kontrolü
- Aktif purchase kontrolü

### 2. Ödeme Formu Gösterilir
- Kart bilgileri
- Fatura bilgileri
- Teslimat adresi
- Fatura adresi

### 3. Ödeme Başlatma (`/api/payments/initialize`)
- Pending purchase kaydı oluşturulur
- Iyzico'ya ödeme isteği gönderilir
- 3D Secure HTML içeriği döner

### 4. 3D Secure İşlemi
- Iyzico'nun döndürdüğü HTML içeriği render edilir
- Kullanıcı 3D Secure doğrulamasını yapar
- Iyzico callback URL'ine yönlendirir

### 5. Callback İşlemi (`/api/payments/callback`)
- Ödeme durumu kontrol edilir
- Purchase kaydı güncellenir (completed/cancelled)
- Kullanıcı success/failure sayfasına yönlendirilir

### 6. Başarılı Ödeme
- Purchase status: `completed`
- `expires_at` hesaplanır (Light: 1 ay, Premium: lifetime)
- Dashboard'a erişim sağlanır

---

## 📝 API Endpoints

### POST `/api/payments/initialize`

Ödeme başlatma endpoint'i.

**Request Body:**
```json
{
  "plan_type": "light" | "premium",
  "paymentCard": {
    "cardHolderName": "JOHN DOE",
    "cardNumber": "5528790000000008",
    "expireMonth": "12",
    "expireYear": "30",
    "cvc": "123"
  },
  "buyer": {
    "name": "John",
    "surname": "Doe",
    "gsmNumber": "+905551234567",
    "email": "user@example.com",
    "identityNumber": "12345678901",
    "registrationAddress": "Test Address",
    "city": "Istanbul",
    "country": "Turkey",
    "zipCode": "34000"
  },
  "shippingAddress": { ... },
  "billingAddress": { ... }
}
```

**Response:**
```json
{
  "ok": true,
  "paymentId": "payment_id_from_iyzico",
  "conversationId": "conv-xxx",
  "htmlContent": "<html>3D Secure HTML</html>",
  "purchaseId": "purchase_uuid"
}
```

### POST/GET `/api/payments/callback`

3D Secure sonrası callback endpoint'i.

**Iyzico'dan gelen parametreler:**
- `paymentId`: Iyzico payment ID
- `conversationData`: (opsiyonel) Conversation data

**Response:**
- Başarılı: `/payment/success?purchaseId=xxx` yönlendirme
- Başarısız: `/payment/failure?paymentId=xxx&error=...` yönlendirme

---

## 🧪 Test Adımları

### 1. Environment Variables Kontrolü

```bash
# .env.local dosyasında olmalı:
IYZICO_API_KEY=test_api_key
IYZICO_SECRET_KEY=test_secret_key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

### 2. Build Kontrolü

```bash
cd repo/web-next
npm run build
```

**Beklenen:** Build başarılı olmalı, hata olmamalı.

### 3. Server Başlatma

```bash
npm run dev
```

**Beklenen:** Server `http://localhost:4173` adresinde çalışmalı.

### 4. Checkout Sayfası Testi

1. Bir kullanıcı ile giriş yapın
2. `/checkout?plan=light` veya `/checkout?plan=premium` sayfasına gidin
3. "Ödemeye Başla" butonuna tıklayın
4. Ödeme formunu doldurun:
   - Test kartı: `5528 7900 0000 0008`
   - Son kullanma: `12/30`
   - CVC: `123`
   - Diğer bilgileri doldurun
5. "Ödemeyi Tamamla" butonuna tıklayın

**Beklenen:**
- 3D Secure sayfası açılmalı
- Test kartı ile ödeme başarılı olmalı
- `/payment/success` sayfasına yönlendirilmeli
- Purchase kaydı `completed` status'ünde olmalı

### 5. Database Kontrolü

```sql
-- Supabase'de kontrol edin:
SELECT * FROM purchases 
WHERE user_id = 'user_id_here' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Beklenen:**
- `status`: `completed`
- `payment_provider`: `iyzico`
- `transaction_id`: Iyzico payment ID
- `expires_at`: Plan tipine göre (Light: 1 ay sonra, Premium: NULL)

---

## ⚠️ Önemli Notlar

### Güvenlik

1. **API Keys:** Asla client-side'da expose edilmemeli
2. **Kart Bilgileri:** Doğrudan database'e kaydedilmemeli
3. **HTTPS:** Production'da mutlaka HTTPS kullanılmalı
4. **Validation:** Tüm input'lar server-side'da validate edilmeli

### Hata Yönetimi

- Tüm Iyzico API çağrıları try-catch ile sarmalanmış
- Hata durumlarında kullanıcıya anlaşılır mesajlar gösteriliyor
- Purchase kayıtları hata durumunda `cancelled` olarak işaretleniyor

### Production'a Geçiş

1. Iyzico production API key'lerini alın
2. `IYZICO_BASE_URL`'i `https://api.iyzipay.com` olarak güncelleyin
3. `IYZICO_API_KEY` ve `IYZICO_SECRET_KEY`'i production değerleriyle değiştirin
4. Test kartlarıyla son bir test yapın
5. Canlı ödemeleri izleyin

---

## 🔍 Debugging

### Log Kontrolü

```bash
# Server loglarında şunları görebilirsiniz:
- "Iyzico payment initialization error:" (hata durumunda)
- "Purchase not found for payment:" (callback'te purchase bulunamazsa)
- "Error updating purchase:" (purchase güncelleme hatası)
```

### Yaygın Hatalar

1. **"Iyzico SDK not available"**
   - Çözüm: `npm install iyzipay` kontrol edin

2. **"PAYMENT_ID_REQUIRED"**
   - Çözüm: Callback URL'in doğru olduğundan emin olun

3. **"PURCHASE_NOT_FOUND"**
   - Çözüm: Purchase kaydının oluşturulduğundan emin olun

---

## ✅ Tamamlanan Özellikler

- [x] Iyzico SDK kurulumu
- [x] Environment variables
- [x] Iyzico helper functions
- [x] Ödeme başlatma API
- [x] Callback handler (POST/GET)
- [x] Payment form component
- [x] Checkout sayfası entegrasyonu
- [x] Success/Failure sayfaları
- [x] Purchase kaydı oluşturma/güncelleme
- [x] 3D Secure desteği
- [x] Hata yönetimi
- [x] TypeScript type definitions

---

**Status:** ✅ **PRODUCTION-READY** (Test edilmesi gerekiyor)

