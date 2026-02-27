# Firebase Hosting — Deploy Adımları

## 1. Giriş (bir kez)

Terminalde (Cursor veya Mac Terminal):

```bash
firebase login
```

Tarayıcı açılır → Google / Firebase hesabınızla giriş yapın.

---

## 2. Proje klasörü

```bash
cd "/Users/ekremmert/Library/CloudStorage/OneDrive-Kişisel/Corvus Tech/Wedding_Digital_Davetiye/CORVUS_Dijital_davetiye/repo/web-next"
```

---

## 3. Proje seçimi

```bash
firebase use ameliea-5a3e4
```

(Zaten `.firebaserc` ile ayarlı.)

---

## 4. Next.js ile Hosting (önerilen)

```bash
firebase experiments:enable webframeworks
firebase init hosting
```

- "Use an existing project" → **Ameliea** seçin.
- "What do you want to use as your public directory?" → Framework kullanacaksanız **Enter** (Firebase öneriyi yazar) veya **out**.
- "Set up automatic builds with GitHub?" → İsterseniz **No** (CLI ile deploy edecekseniz).

Sonra:

```bash
npm run build
firebase deploy
```

---

## 5. Sadece static denemek isterseniz

API’ler çalışmaz; sadece statik sayfalar yayınlanır:

- `next.config.ts` içine `output: 'export'` eklenmeli.
- `npm run build` → `out` klasörü oluşur.
- `firebase deploy` → `out` deploy edilir.

---

## Önemli

- **API route’lar** (login, register, ödeme, davetiye API’leri) için sunucu gerekir.
- **Firebase Hosting** yalnızca statik dosya sunar.
- Tam uygulama için **Firebase App Hosting** (GitHub bağlantılı) kullanın; böylece Next.js sunucu tarafı da çalışır.

Domain: Firebase Console → Hosting → **Add custom domain** → ameliea.co / www.ameliea.co ekleyip GoDaddy DNS’i Firebase’in verdiği kayıtlara göre ayarlayın.
