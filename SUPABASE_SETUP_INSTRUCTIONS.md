# 🚀 Supabase Setup - Hızlı Başlangıç

**Project URL:** `https://ascmdcotrxukamdsftjs.supabase.co`  
**Status:** ✅ `.env.local` oluşturuldu

---

## ✅ Tamamlanan Adımlar

1. ✅ `.env.local` dosyası oluşturuldu
2. ✅ Supabase bağlantı bilgileri yapılandırıldı

---

## 📋 Yapılması Gerekenler

### 1. Supabase SQL Schema'yı Çalıştır

1. **Supabase Dashboard'a git:**
   - [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Projenizi seçin: `ascmdcotrxukamdsftjs`

2. **SQL Editor'ü aç:**
   - Sol menüden **SQL Editor** → **New Query**

3. **Schema'yı çalıştır:**
   - `supabase/schema.sql` dosyasının içeriğini kopyala
   - SQL Editor'e yapıştır
   - **Run** butonuna tıkla (veya Cmd/Ctrl + Enter)

4. **Doğrula:**
   - Sol menüden **Table Editor** → `invitations` ve `rsvps` tabloları görünmeli

---

### 2. Email Auth Provider'ı Aktifleştir

1. **Authentication** → **Providers** → **Email**
2. **Enable Email provider** seçeneğini aç
3. **Magic Link** veya **Password** seç (Magic Link önerilir)
4. **Save** butonuna tıkla

---

### 3. Test Bağlantısı

```bash
cd repo/web-next

# Dev server'ı başlat
npm run dev

# Başka bir terminal'de test et
curl http://localhost:4173/api/health
# Beklenen: {"status":"healthy","database":"connected"}
```

---

## 🔍 Sorun Giderme

### "Row Level Security policy violation" hatası
- **Çözüm:** SQL schema'yı çalıştırdığınızdan emin olun
- RLS policies `supabase/schema.sql` içinde tanımlı

### "Invitation not found" hatası
- **Çözüm:** Tablolar oluşturulmuş mu kontrol edin
- Table Editor'da `invitations` tablosu görünmeli

### "Unauthorized" hatası
- **Çözüm:** Email Auth provider aktif mi kontrol edin
- Authentication → Providers → Email → Enabled

---

## 📝 Sonraki Adımlar

1. ✅ SQL schema çalıştırıldı
2. ✅ Email Auth aktif
3. ✅ Health endpoint test edildi
4. → `/login` sayfasından magic link gönder
5. → İlk davetiye oluştur
6. → RSVP test et

---

**Hazırlayan:** Corvus Quant Architect  
**Tarih:** 2026-01-18

