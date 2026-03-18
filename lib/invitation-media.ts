/**
 * Tema başına 1 açılış videosu + 1 kapak görseli (Zarf).
 * Temalar klasöründeki Video.mp4 ve Zarf.* kullanılır.
 * Fallback: 404 veya yükleme hatası durumunda kullanılabilecek placeholder.
 */

import type { ThemeId } from '@/lib/themes';
import { getThemeAssetsByThemeId } from '@/lib/theme-assets';

/** Placeholder image (1x1 transparent or simple gradient) when theme asset fails to load */
export const FALLBACK_COVER_IMAGE =
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect fill="%231b1620" width="800" height="600"/><text x="400" y="300" fill="%23fbf7ef" font-family="serif" font-size="24" text-anchor="middle">Invitation</text></svg>');

export interface TemplateMedia {
  /** Bu temanın açılış videosu - davetli linkte ilk oynar (Temalar/{tema}/Video.mp4) */
  introVideoUrl: string;
  /** Video bittikten sonra gösterilen davetiye görseli - Zarf (Temalar/{tema}/Zarf.*) */
  coverImageUrl: string;
  /** 404/load error durumunda kullanılacak kapak görseli */
  fallbackCoverImageUrl: string;
}

export function getTemplateMedia(themeId: ThemeId): TemplateMedia {
  const { videoUrl, zarfUrl } = getThemeAssetsByThemeId(themeId);
  return {
    introVideoUrl: videoUrl,
    coverImageUrl: zarfUrl,
    fallbackCoverImageUrl: FALLBACK_COVER_IMAGE,
  };
}
