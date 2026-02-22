/**
 * Design Tokens — Ameliea
 * Premium, minimal, emotional design system
 */

export const tokens = {
  colors: {
    // Base palette (Aşk · Elit · Ruhun Güzelliği)
    ivory: {
      base: '#fbf7ef',
      light: '#fefcf8',
      dark: '#f6efe4',
    },
    gold: {
      base: '#c8a24a',
      light: '#eadbb2',
      dark: '#a6893a',
    },
    crimson: {
      base: '#a12b3a',
      light: '#c83d4f',
      dark: '#7a1f2a',
    },
    ink: {
      base: '#1b1620',
      light: '#2a2431',
      dark: '#0f0c14',
    },
    rose: {
      base: '#f3d7da',
      light: '#f9e8ea',
      dark: '#e8c4c8',
    },
    // Semantic colors
    bg: {
      primary: '#fbf7ef',
      secondary: '#f6efe4',
      panel: 'rgba(255, 255, 255, 0.72)',
      panelStrong: 'rgba(255, 255, 255, 0.92)',
    },
    text: {
      primary: 'rgba(27, 22, 32, 0.92)',
      secondary: 'rgba(27, 22, 32, 0.66)',
      muted: 'rgba(27, 22, 32, 0.50)',
    },
    border: {
      base: 'rgba(27, 22, 32, 0.14)',
      light: 'rgba(27, 22, 32, 0.10)',
      strong: 'rgba(27, 22, 32, 0.22)',
    },
  },
  typography: {
    fontFamily: {
      serif: ['ui-serif', 'Georgia', '"Times New Roman"', 'Times', 'serif'],
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      /** Ameliea marka yazı tipi — Bad Script (script / el yazısı) */
      brand: ['var(--font-ameliea)', '"Bad Script"', 'cursive'],
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.05em',
    },
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '14px',
    xl: '20px',
    full: '999px',
  },
  shadows: {
    sm: '0 2px 8px rgba(27, 22, 32, 0.08)',
    md: '0 8px 24px rgba(27, 22, 32, 0.12)',
    lg: '0 18px 60px rgba(27, 22, 32, 0.14)',
    xl: '0 26px 90px rgba(27, 22, 32, 0.20)',
  },
  motion: {
    duration: {
      fast: 140,
      med: 260,
      slow: 520,
    },
    easing: {
      out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export type DesignTokens = typeof tokens;

