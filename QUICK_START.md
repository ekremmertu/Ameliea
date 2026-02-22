# 🚀 Quick Start - Doğru Dizin

**Önemli:** Tüm komutlar `repo/web-next/` dizininde çalıştırılmalı!

---

## ✅ Doğru Kullanım

```bash
# 1. Doğru dizine git
cd repo/web-next

# 2. Build
npm run build

# 3. Dev server
npm run dev

# 4. Production server
npm run start
```

---

## ❌ Yanlış Kullanım

```bash
# Root dizinde çalıştırma (HATA!)
cd /Users/ekremmert/Documents/CORVUS_Dijital_davetiye
npm run build  # ❌ package.json bulunamaz
```

---

## 📁 Dizin Yapısı

```
CORVUS_Dijital_davetiye/
├── repo/
│   └── web-next/          ← ✅ BURADA ÇALIŞTIR
│       ├── package.json
│       ├── next.config.ts
│       └── ...
└── ...
```

---

**Not:** Tüm npm komutları `repo/web-next/` dizininde çalıştırılmalı!

