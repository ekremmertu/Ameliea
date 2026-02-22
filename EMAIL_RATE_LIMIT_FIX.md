# 📧 Email Rate Limit Sorunu - Çözüm

**Tarih:** 2026-01-18  
**Sorun:** "Email rate limit exceeded" hatası

---

## 🔍 Sorun

Supabase'in email gönderme limiti aşıldı. Bu genellikle:
- Çok fazla test email'i gönderilmesi
- Email confirmation açıkken kayıt denemeleri
- Magic link denemeleri

---

## ✅ Çözümler

### 1. Supabase Dashboard'da Email Confirmation'ı Kapat (KRİTİK)

**Yol:** Supabase Dashboard → Authentication → Providers → Email

**Ayar:**
- ✅ **Enable Email provider:** Açık
- ❌ **Confirm email:** **KAPALI** (OFF) ← **BU ÇOK ÖNEMLİ**

**Neden:** Email confirmation kapalı olursa, kayıt sırasında email gönderilmez.

---

### 2. Rate Limit'i Bekle

**Süre:** Genellikle 1 saat içinde reset olur.

**Alternatif:** Supabase Support'a başvurun (eğer acilse).

---

### 3. Test Kullanıcısı Oluşturma (Email Göndermez)

Test kullanıcısı script'i zaten admin API kullanıyor, email göndermiyor:

```bash
cd repo/web-next
node scripts/create-test-user.js test@example.com
```

**Not:** Bu script email göndermez, direkt kullanıcı oluşturur.

---

### 4. Development için Email Göndermeyi Tamamen Kapat

**Supabase Dashboard → Authentication → Email Templates**

Tüm email template'lerini kapatın:
- ❌ Confirm signup
- ❌ Magic Link
- ❌ Change Email Address
- ❌ Reset Password (opsiyonel - şifre unutma için açık kalabilir)

---

## 🧪 Test (Email Göndermeden)

### 1. Test Kullanıcısı Oluştur (Email Göndermez)
```bash
cd repo/web-next
node scripts/create-test-user.js test@corvus.app
```

### 2. Direkt Giriş Yap
```
http://localhost:4173/login
```

**Form:**
- Email: test@corvus.app
- Şifre: Test123!@# (script'te belirtilen)

**Beklenen:**
- ✅ Giriş başarılı (email onayı gerekmez)

---

## 📋 Kontrol Listesi

- [ ] Supabase Dashboard → Auth → Providers → Email → Confirm email: **KAPALI**
- [ ] Rate limit geçti mi? (1 saat bekleyin)
- [ ] Test kullanıcısı ile giriş yapıldı mı?
- [ ] Yeni kayıt denemesi yapıldı mı? (email gönderilmemeli)

---

## ⚠️ Önemli Notlar

1. **Email confirmation KAPALI olmalı** - Aksi halde her kayıt email gönderir
2. **Rate limit genellikle 1 saat içinde reset olur**
3. **Test kullanıcısı script'i email göndermez** - Güvenle kullanılabilir
4. **Production'da email confirmation açık olabilir** - Ama development'ta kapalı olmalı

---

**Status:** ⏳ **SUPABASE DASHBOARD'DA EMAIL CONFIRMATION KAPALI OLMALI**

