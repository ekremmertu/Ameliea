# 🧪 Test Altyapısı Kurulumu

**Tarih:** 2026-01-18  
**Durum:** ✅ Test altyapısı kuruldu

---

## 📦 Kurulu Test Araçları

### 1. Jest + React Testing Library
- **Unit Test:** Component ve utility fonksiyonları
- **Integration Test:** Component etkileşimleri
- **Coverage:** Test coverage raporu

### 2. Playwright
- **E2E Test:** Kullanıcı akışları, sayfa navigasyonu
- **Cross-browser:** Chrome, Firefox, Safari
- **Mobile:** Responsive testler

---

## 🚀 Kullanım

### Unit/Component Testleri

```bash
# Tüm testleri çalıştır
npm run test

# Watch mode (değişiklikleri izle)
npm run test:watch

# Coverage raporu
npm run test:coverage
```

### E2E Testleri

```bash
# Tüm E2E testleri çalıştır
npm run test:e2e

# UI mode (interaktif)
npm run test:e2e:ui

# Tüm testleri çalıştır (unit + e2e)
npm run test:all
```

---

## 📁 Test Dosya Yapısı

```
repo/web-next/
├── tests/
│   ├── __tests__/              # Unit/Component testleri
│   │   ├── components/         # Component testleri
│   │   │   └── Button.test.tsx
│   │   └── lib/               # Utility testleri
│   │       └── design-tokens.test.ts
│   └── e2e/                   # E2E testleri
│       ├── home.spec.ts       # Ana sayfa testleri
│       └── auth.spec.ts        # Authentication testleri
├── jest.config.js             # Jest konfigürasyonu
├── jest.setup.js              # Jest setup dosyası
└── playwright.config.ts       # Playwright konfigürasyonu
```

---

## ✅ Mevcut Testler

### Unit Tests
- ✅ `Button.test.tsx` - Button component testleri
- ✅ `design-tokens.test.ts` - Design tokens validation

### E2E Tests
- ✅ `home.spec.ts` - Ana sayfa testleri
  - Sayfa yükleme
  - Header görünürlüğü
  - Hero section
  - Navigasyon (login/register)
  - Responsive testler
- ✅ `auth.spec.ts` - Authentication testleri
  - Login form
  - Register form
  - Form validasyonu
  - Navigasyon

---

## 📊 Test Coverage Hedefi

- **Branches:** 50%
- **Functions:** 50%
- **Lines:** 50%
- **Statements:** 50%

---

## 🔧 Konfigürasyon

### Jest
- **Setup:** `jest.setup.js` - Testing Library ve mock'lar
- **Config:** `jest.config.js` - Next.js entegrasyonu
- **Coverage:** `coverage/` klasöründe raporlar

### Playwright
- **Config:** `playwright.config.ts`
- **Browsers:** Chromium, Firefox, WebKit
- **Mobile:** Pixel 5, iPhone 12
- **Server:** Otomatik dev server başlatma

---

## 📝 Yeni Test Yazma

### Component Test Örneği

```typescript
// tests/__tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Örneği

```typescript
// tests/e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test('my feature works', async ({ page }) => {
  await page.goto('/my-feature');
  await expect(page.locator('h1')).toHaveText('My Feature');
});
```

---

## 🎯 Sonraki Adımlar

### Öncelikli Testler (P1)
1. ✅ Button component testi (tamamlandı)
2. ⏳ API route testleri (`/api/invitations/*`)
3. ⏳ Form validation testleri
4. ⏳ Dashboard testleri
5. ⏳ RSVP form testleri

### Orta Öncelikli Testler (P2)
6. ⏳ Integration testleri (component + API)
7. ⏳ Error boundary testleri
8. ⏳ Loading state testleri
9. ⏳ i18n testleri

---

## 📚 Kaynaklar

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**Hazırlayan:** Corvus Quant Architect  
**Tarih:** 2026-01-18

