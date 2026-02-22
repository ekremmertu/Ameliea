/**
 * Tema başına 1 açılış videosu + 1 kapak görseli.
 * 5 tema = 5 video. Kullanıcı temayı seçer, düzenleyip gönderir; davetli o temanın videosunu açar.
 */

import type { ThemeId } from '@/lib/themes';

export interface TemplateMedia {
  /** Bu temanın açılış videosu - davetli linkte ilk oynar */
  introVideoUrl: string;
  /** Video bittikten sonra gösterilen davetiye görseli (üzerine ad/tarih/mekan yazılır) */
  coverImageUrl: string;
}

const PLACEHOLDER_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80';

/** theme_id → 1 intro video, 1 cover image. Kendi 5 video URL'inizi yazın. */
export const TEMPLATE_MEDIA: Record<ThemeId, TemplateMedia> = {
  elegant: {
    introVideoUrl: PLACEHOLDER_VIDEO,
    coverImageUrl: PLACEHOLDER_IMAGE,
  },
  modern: {
    introVideoUrl: PLACEHOLDER_VIDEO,
    coverImageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
  },
  romantic: {
    introVideoUrl: PLACEHOLDER_VIDEO,
    coverImageUrl: 'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800&q=80',
  },
  classic: {
    introVideoUrl: PLACEHOLDER_VIDEO,
    coverImageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
  },
  minimal: {
    introVideoUrl: PLACEHOLDER_VIDEO,
    coverImageUrl: 'https://images.unsplash.com/photo-1478146896981-b80fe4633303?w=800&q=80',
  },
};

export function getTemplateMedia(themeId: ThemeId): TemplateMedia {
  return TEMPLATE_MEDIA[themeId] ?? TEMPLATE_MEDIA.elegant;
}
