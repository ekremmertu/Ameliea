# Amor Élite — Premium Digital Invitations

**Next.js 14 + TypeScript + Framer Motion**

---

## 🎯 Premium Strategy

This site positions wedding organization as a **premium, elite, emotional experience**—not a transactional service.

### Key Principles
- ❌ **NO pricing** displayed
- ❌ **NO package details** listed
- ✅ **Conversation-focused CTAs**: "Start a conversation", "Tell us your story"
- ✅ **Emotional connection** over information overload
- ✅ **Elite filtering**: Only attracts high-budget, experience-focused couples

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
