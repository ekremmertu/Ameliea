# 🔑 Supabase Tam Erişim İçin Gerekenler

## İhtiyacım Olan: Service Role Key

**Neden?**
- Admin işlemleri yapabilmek için
- RLS policies'i bypass edebilmek için
- Tüm verileri görebilmek için
- Schema değişiklikleri yapabilmek için

---

## 📋 Nasıl Alınır?

### Supabase Dashboard:
1. [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Projenizi seçin: `ascmdcotrxukamdsftjs`
3. **Project Settings** → **API**
4. **service_role** key'i kopyalayın (anon key'in altında)
5. ⚠️ **DİKKAT:** Bu key çok güçlü, asla client-side'da kullanmayın!

---

## 🔐 Mevcut Erişim

**Anon Key (Mevcut):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzY21kY290cnh1a2FtZHNmdGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODExMzQsImV4cCI6MjA4NjE1NzEzNH0.rDMfoE0ecrtoAKUdVfdHNWDCOW8Efok7S7MRY2p-Wxg
```

**Service Role Key (İhtiyacım olan):**
- Project Settings → API → service_role key
- Genellikle `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ile başlar
- Anon key'den daha uzun olabilir

---

## ✅ Service Role Key ile Yapabileceklerim

1. ✅ Tüm tabloları okuma (RLS bypass)
2. ✅ Tüm verileri görme
3. ✅ Schema değişiklikleri
4. ✅ Admin işlemleri
5. ✅ Kullanıcı yönetimi
6. ✅ Database backup/restore

---

**Service Role Key'i paylaşabilir misiniz?**

