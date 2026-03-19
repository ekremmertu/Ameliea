# Amor Élite — Premium Digital Invitations

**Next.js 14 + TypeScript + Framer Motion**

---

## 🎯 Sales Strategy

This site positions wedding invitations as a **premium, emotional experience** for brides who value aesthetics and control.

### Key Principles
- ✅ **Two-tier model**: Light (elegant start) + Premium (unforgettable experience)
- ✅ **Emotion-first CTAs**: "Create your invitation", "Start creating now"
- ✅ **Decision architecture**: Premium pre-selected, bride-focused badge, outcome-driven copy
- ✅ **Soft upsell**: Light checkout shows a gentle Premium upgrade nudge
- ✅ **Centralized plan data**: All pricing, features and sales copy in `lib/constants.ts`

---

## 🚀 Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
web-next/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (SEO, metadata)
│   ├── page.tsx           # Home page
│   ├── globals.css        # Premium theme styles
│   ├── sitemap.ts         # Dynamic sitemap
│   └── robots.ts          # Robots.txt
├── components/
│   ├── layout/            # Header, Footer
│   ├── sections/          # Hero, Journey, Themes, etc.
│   └── ui/                # Button, Card, Image
├── lib/
│   ├── design-tokens.ts   # Premium color palette, typography
│   └── i18n.ts            # TR/EN translations
└── hooks/
    └── useI18n.ts         # i18n hook
```

---

## 🎨 Design System

### Colors
- **Ivory**: `#fbf7ef` (base background)
- **Gold**: `#c8a24a` (accent)
- **Crimson**: `#a12b3a` (hover, emotional accent)
- **Ink**: `#1b1620` (text)

### Typography
- **Serif**: Editorial, premium feel
- **Sans**: Inter (system fallback)

### Motion
- **Framer Motion**: Smooth, emotional animations
- **Hover**: Crimson background + white text (premium feel)

---

## 🌍 i18n

- **TR**: Turkish
- **EN**: English (default)

Switch via header language toggle.

---

## 📱 Features

- ✅ Next.js 14 (App Router, SSR)
- ✅ TypeScript
- ✅ Framer Motion animations
- ✅ Premium design system
- ✅ i18n (TR/EN)
- ✅ SEO optimized (metadata, sitemap, robots.txt)
- ✅ Image optimization (Next.js Image)
- ✅ Responsive design
- ✅ Accessibility (WCAG 2.1 AA)

---

## 🔧 API Integration

Contact form sends to: `http://127.0.0.1:8010/contact`

Update `components/sections/Contact.tsx` for production API URL.

---

## 📊 Performance

- **Lighthouse Target**: 95+
- **Bundle Size**: Optimized with code splitting
- **Images**: WebP/AVIF with lazy loading

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel
```

### Other Platforms

```bash
npm run build
npm start
```

---

**Built with ❤️ by Corvus Company OS**
