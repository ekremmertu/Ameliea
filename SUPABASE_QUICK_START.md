# 🚀 Supabase Quick Start - Hızlı Başlangıç

**Project:** `ascmdcotrxukamdsftjs.supabase.co`  
**Status:** ✅ Bağlantı test edildi, `.env.local` hazır

---

## ✅ Tamamlanan

1. ✅ `.env.local` dosyası oluşturuldu
2. ✅ Supabase bağlantısı test edildi (çalışıyor)
3. ✅ SQL schema hazır (145 satır)

---

## 📋 Yapılması Gerekenler (5 dakika)

### 1. SQL Schema'yı Çalıştır

**Supabase Dashboard:**
1. [https://supabase.com/dashboard](https://supabase.com/dashboard) → Projenizi seçin
2. **SQL Editor** → **New Query**
3. `supabase/schema.sql` dosyasının **tüm içeriğini** kopyala-yapıştır
4. **Run** (Cmd/Ctrl + Enter)
5. ✅ Başarılı mesajı görmelisiniz

**Doğrulama:**
- **Table Editor** → `invitations` ve `rsvps` tabloları görünmeli

---

### 2. Email Auth Aktifleştir

1. **Authentication** → **Providers** → **Email**
2. ✅ **Enable Email provider**
3. **Magic Link** seç (önerilir)
4. **Save**

---

### 3. Test Et

```bash
cd repo/web-next

# Dev server başlat (zaten çalışıyor olabilir)
npm run dev

# Başka terminal'de test
curl http://localhost:4173/api/health
# Beklenen: {"status":"healthy","database":"connected"}
```

---

## 🎯 Sonraki Adımlar

1. ✅ SQL schema çalıştırıldı
2. ✅ Email Auth aktif
3. → `/login` sayfasına git
4. → Email ile magic link gönder
5. → İlk davetiye oluştur
6. → RSVP test et

---

## 📝 SQL Schema Özeti

**Tablolar:**
- `invitations` - Davetiye bilgileri
- `rsvps` - RSVP yanıtları

**RLS Policies:**
- Owner-only dashboard access
- Public invitation read (published only)
- Public RSVP insert (published invitations only)

**Toplam:** 145 satır SQL

---

**Hazırlayan:** Corvus Quant Architect  
**Tarih:** 2026-01-18

