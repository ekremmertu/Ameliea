/**
 * Theme System
 * Defines all available themes with their configurations
 */

export type ThemeId = 'elegant' | 'modern' | 'romantic' | 'classic' | 'minimal';

export interface ThemeConfig {
  id: ThemeId;
  name: {
    tr: string;
    en: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  animation: {
    component: string; // Component name
    duration: number; // Animation duration in seconds
  };
  layout: {
    style: 'centered' | 'asymmetric' | 'magazine';
    decorativeElements: boolean;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  elegant: {
    id: 'elegant',
    name: {
      tr: 'Zarif',
      en: 'Elegant',
    },
    colors: {
      primary: '#c8a24a', // Gold
      secondary: '#a12b3a', // Crimson
      accent: '#fbf7ef', // Ivory
    },
    fonts: {
      heading: 'serif',
      body: 'serif',
    },
    animation: {
      component: 'ElegantIntro',
      duration: 10,
    },
    layout: {
      style: 'centered',
      decorativeElements: true,
    },
  },
  modern: {
    id: 'modern',
    name: {
      tr: 'Modern',
      en: 'Modern',
    },
    colors: {
      primary: '#1b1620', // Navy
      secondary: '#e8c4c8', // Rose
      accent: '#fbf7ef', // Ivory
    },
    fonts: {
      heading: 'sans',
      body: 'sans',
    },
    animation: {
      component: 'ModernIntro',
      duration: 8,
    },
    layout: {
      style: 'asymmetric',
      decorativeElements: false,
    },
  },
  romantic: {
    id: 'romantic',
    name: {
      tr: 'Romantik',
      en: 'Romantic',
    },
    colors: {
      primary: '#f3d7da', // Blush
      secondary: '#9caf88', // Sage
      accent: '#fbf7ef', // Ivory
    },
    fonts: {
      heading: 'serif',
      body: 'serif',
    },
    animation: {
      component: 'RomanticIntro',
      duration: 12,
    },
    layout: {
      style: 'centered',
      decorativeElements: true,
    },
  },
  classic: {
    id: 'classic',
    name: {
      tr: 'Klasik',
      en: 'Classic',
    },
    colors: {
      primary: '#fbf7ef', // Ivory
      secondary: '#c8a24a', // Gold
      accent: '#1b1620', // Ink
    },
    fonts: {
      heading: 'serif',
      body: 'serif',
    },
    animation: {
      component: 'ClassicIntro',
      duration: 10,
    },
    layout: {
      style: 'magazine',
      decorativeElements: true,
    },
  },
  minimal: {
    id: 'minimal',
    name: {
      tr: 'Minimal',
      en: 'Minimal',
    },
    colors: {
      primary: '#1b1620', // Ink
      secondary: '#fbf7ef', // Ivory
      accent: '#c8a24a', // Gold
    },
    fonts: {
      heading: 'sans',
      body: 'sans',
    },
    animation: {
      component: 'MinimalIntro',
      duration: 6,
    },
    layout: {
      style: 'centered',
      decorativeElements: false,
    },
  },
};

/**
 * Get theme by ID
 */
export function getTheme(themeId: ThemeId): ThemeConfig {
  return THEMES[themeId] || THEMES.elegant;
}

/**
 * Get all themes as array
 */
export function getAllThemes(): ThemeConfig[] {
  return Object.values(THEMES);
}

