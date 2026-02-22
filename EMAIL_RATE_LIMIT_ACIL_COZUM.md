# 🚨 Email Rate Limit - Acil Çözüm

**Tarih:** 2026-01-18  
**Sorun:** "Email rate limit exceeded" hatası

---

## ⚡ Hızlı Çözüm

### 1. Supabase Dashboard'da Email Confirmation'ı Kapat (5 dakika)

**Adımlar:**
1. Supabase Dashboard'a gidin
2. **Authentication** → **Providers** → **Email** bölümüne gidin
3. **"Confirm email"** seçeneğini **KAPALI** yapın
4. **Save** butonuna tıklayın

**Sonuç:** Artık kayıt sırasında email gönderilmez, rate limit sorunu çözülür.

---

### 2. Rate Limit'i Bekle (1 saat)

Eğer hala hata alıyorsanız:
- **Süre:** Genellikle 1 saat içinde reset olur
- **Alternatif:** Supabase Support'a başvurun

---

### 3. Test Kullanıcısı Kullan (Email Göndermez)

Test kullanıcısı script'i **email göndermez**, direkt kullanıcı oluşturur:

```bash
cd repo/web-next
node scripts/create-test-user.js test@corvus.app
```

**Kullanıcı:**
- Email: `test@corvus.app`
- Password: `Test123!@#`

**Giriş:**
```
http://localhost:4173/login
```

---

## ✅ Yapılan Kod Değişiklikleri

1. ✅ `RegisterForm.tsx` - `emailRedirectTo` kaldırıldı (email göndermez)
2. ✅ Test kullanıcısı script'i - Email göndermez (admin API)

---

## 📋 Kontrol Listesi

- [ ] Supabase Dashboard → Auth → Providers → Email → **Confirm email: KAPALI**
- [ ] Rate limit geçti mi? (1 saat bekleyin)
- [ ] Test kullanıcısı ile giriş yapıldı mı?
- [ ] Yeni kayıt denemesi yapıldı mı? (email gönderilmemeli)

---

## 🎯 Sonuç

**Email confirmation KAPALI** olduğunda:
- ✅ Kayıt sırasında email gönderilmez
- ✅ Rate limit sorunu çözülür
- ✅ Kullanıcı direkt giriş yapabilir
- ✅ Email onayı gerekmez

---

**Status:** ⏳ **SUPABASE DASHBOARD'DA EMAIL CONFIRMATION KAPALI OLMALI**

