# API'ler Çalışır Şekilde Deploy — Vercel (Adım Adım)

Next.js + API route'lar Vercel'de **aynen** çalışır. Aşağıdaki adımları sırayla yapın.

---

## Adım 1 — Vercel hesabı

1. Tarayıcıda **https://vercel.com** açın.
2. **Sign Up** veya **Login**.
3. **Continue with GitHub** seçin → GitHub ile giriş yapın (ekremmertu).
4. Gerekirse "Authorize Vercel" iznini verin.

---

## Adım 2 — Projeyi import et

1. Vercel dashboard’da **Add New…** → **Project**.
2. **Import Git Repository** bölümünde **GitHub**’ı seçin.
3. Repo listesinden **ekremmertu/Ameliea**’yı bulun → **Import**.
4. Eğer reponuz görünmüyorsa **Configure GitHub App** / **Adjust GitHub App Permissions** deyip **Ameliea** reposuna erişim verin, tekrar deneyin.

---

## Adım 3 — Build ayarları

Import ekranında:

- **Project Name:** ameliea (veya istediğiniz isim).
- **Framework Preset:** Next.js (otomatik seçili olmalı).
- **Root Directory:** boş bırakın (`.` = proje kökü).
- **Build Command:** `npm run build` (varsayılan).
- **Output Directory:** boş (Next.js varsayılanı kullanır).

Bunları olduğu gibi bırakıp **Environment Variables** kısmına geçin.

---

## Adım 4 — Environment Variables (önemli)

**Environment Variables** bölümünde aşağıdakileri **Name** ve **Value** olarak ekleyin.  
(Şimdilik değerleri kendi Supabase ve ayarlarınızdan doldurun; ilk deploy için placeholder da olur.)

| Name | Value | Not |
|------|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase projenizin URL’i | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key | Aynı sayfada |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key | Aynı sayfada (gizli tutun) |
| `NEXT_PUBLIC_APP_URL` | İlk deploy sonrası: `https://ameliea-xxx.vercel.app` | İlk deploy’dan sonra güncelleyebilirsiniz |
| `ADMIN_EMAILS` | Örn. `admin@ameliea.co` | Virgülle birden fazla eklenebilir |

**İlk seferde:**  
- `NEXT_PUBLIC_APP_URL` için geçici olarak `https://ameliea.vercel.app` veya deploy sonrası verilen adresi yazın.  
- Deploy bittikten sonra **Project → Settings → Environment Variables**’dan `NEXT_PUBLIC_APP_URL`’i `https://www.ameliea.co` yapıp **Save** deyin, gerekirse **Redeploy** edin.

**Iyzico (ödeme)** kullanacaksanız aynı yere şunları da ekleyin:

- `IYZICO_API_KEY`
- `IYZICO_SECRET_KEY`
- `IYZICO_BASE_URL` = `https://api.iyzipay.com` (canlı) veya `https://sandbox-api.iyzipay.com` (test)

Hepsini **Production** (ve isterseniz Preview) için işaretleyin.

---

## Adım 5 — Deploy

1. **Deploy** butonuna tıklayın.
2. Build log’ları izleyin; hata olursa genelde env eksik/yanlış demektir.
3. Bittiğinde **Visit** veya proje adına tıklayın → site `https://ameliea-xxxx.vercel.app` gibi bir adreste açılır.
4. Şunları test edin:
   - Ana sayfa
   - `/register` — form çalışıyor mu
   - `/api/health` — tarayıcıda açın, `{"status":"ok"}` benzeri bir yanıt gelmeli

Bunlar çalışıyorsa API’ler de çalışıyor demektir.

---

## Adım 6 — Özel domain (ameliea.co)

1. Vercel’de projeye girin → **Settings** → **Domains**.
2. **Add** → sırayla yazın:
   - `ameliea.co`
   - `www.ameliea.co`
3. Vercel size hangi DNS kayıtlarını eklemeniz gerektiğini gösterecek (genelde şöyle):
   - **ameliea.co (root):** A → `76.76.21.21`
   - **www:** CNAME → `cname.vercel-dns.com`

---

## Adım 7 — GoDaddy DNS

1. **GoDaddy** → Domainlerim → **ameliea.co** → **DNS’i Yönet**.
2. **A kaydı (root):**
   - Ad: `@`
   - Tür: A
   - Veri: `76.76.21.21`
   - Eski “WebsiteBuilder” A kaydını silin veya bu değerle değiştirin.
3. **www:**
   - Ad: `www`
   - Tür: CNAME
   - Veri: `cname.vercel-dns.com`
4. Kaydedin. Yayılması 5–60 dakika sürebilir.

---

## Adım 8 — Son kontrol

1. Vercel **Domains** sayfasında ameliea.co ve www.ameliea.co yanında **Verified** görünene kadar bekleyin.
2. Tarayıcıda **https://www.ameliea.co** açın — site ve API’ler çalışıyor olmalı.
3. `NEXT_PUBLIC_APP_URL` değişkenini **https://www.ameliea.co** yaptıysanız, e-posta linkleri ve OAuth callback’ler de bu adrese gider.

---

## Özet

| Adım | Ne yaptınız |
|------|-------------|
| 1 | Vercel’e GitHub ile giriş |
| 2 | ekremmertu/Ameliea repo’yu import |
| 3 | Build ayarları (Next.js, root = proje kökü) |
| 4 | Supabase + APP_URL + ADMIN env’leri ekleme |
| 5 | Deploy + Visit ile test |
| 6 | Vercel’de ameliea.co ve www.ameliea.co domain ekleme |
| 7 | GoDaddy’de A + CNAME kayıtları |
| 8 | Domain verified ve site çalışır durumda |

Takıldığınız adımı yazarsanız, o adımı birlikte netleştirebiliriz.
