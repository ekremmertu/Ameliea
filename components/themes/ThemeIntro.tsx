/**
 * Theme Intro Wrapper
 * Dynamically loads the correct theme intro animation
 */

'use client';

import { ThemeId } from '@/lib/themes';
import { ElegantIntro } from './elegant/ElegantIntro';
import { ModernIntro } from './modern/ModernIntro';
import { RomanticIntro } from './romantic/RomanticIntro';
import { ClassicIntro } from './classic/ClassicIntro';
import { MinimalIntro } from './minimal/MinimalIntro';

interface ThemeIntroProps {
  themeId: ThemeId;
  onComplete: () => void;
  themeColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function ThemeIntro({ themeId, onComplete, themeColors }: ThemeIntroProps) {
  switch (themeId) {
    case 'elegant':
      return <ElegantIntro onComplete={onComplete} themeColors={themeColors} />;
    case 'modern':
      return <ModernIntro onComplete={onComplete} themeColors={themeColors} />;
    case 'romantic':
      return <RomanticIntro onComplete={onComplete} themeColors={themeColors} />;
    case 'classic':
      return <ClassicIntro onComplete={onComplete} themeColors={themeColors} />;
    case 'minimal':
      return <MinimalIntro onComplete={onComplete} themeColors={themeColors} />;
    default:
      return <ElegantIntro onComplete={onComplete} themeColors={themeColors} />;
  }
}

