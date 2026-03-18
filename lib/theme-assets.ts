/**
 * Tema medya varlıkları — Temalar klasörü (Görsel, Video, Zarf)
 * Her tema: Görsel = tanıtım görseli, Video = davetli açılış videosu, Zarf = kapak görseli
 *
 * Video dosyaları (17-31 MB) Supabase Storage'da tutulur.
 * Görseller ve Zarf dosyaları public/temalar/ altında servis edilir.
 */

import type { ThemeId } from '@/lib/themes';

const BASE = '/temalar';
const SUPABASE_STORAGE_BUCKET = 'theme-assets';

/**
 * Supabase Storage public URL oluşturur.
 * NEXT_PUBLIC_SUPABASE_URL tanımlıysa Supabase'den, yoksa lokal /public'ten servis edilir.
 */
function videoUrl(folder: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('your-project')) {
    return `${supabaseUrl}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/temalar/${encodeURIComponent(folder)}/Video.mp4`;
  }
  // Fallback: lokal public klasör (geliştirme ortamı)
  return `${BASE}/${encodeURIComponent(folder)}/Video.mp4`;
}

/** Klasör adı → tema dosya uzantıları (Görsel, Zarf) */
export const THEME_FOLDER_ASSETS: Array<{
  folderName: string;
  themeId: ThemeId;
  styleKey: string;
  görselExt: string;
  zarfExt: string;
}> = [
  { folderName: 'Aşk', themeId: 'romantic', styleKey: 'style_1', görselExt: 'jpeg', zarfExt: 'jpg' },
  { folderName: 'Elit', themeId: 'elegant', styleKey: 'style_2', görselExt: 'jpg', zarfExt: 'jpg' },
  { folderName: 'Ruhun Güzelliği', themeId: 'modern', styleKey: 'style_3', görselExt: 'jpeg', zarfExt: 'webp' },
  { folderName: 'Vow', themeId: 'classic', styleKey: 'style_4', görselExt: 'jpg', zarfExt: 'jpg' },
  { folderName: 'Bloom', themeId: 'minimal', styleKey: 'style_5', görselExt: 'jpeg', zarfExt: 'jpg' },
];

function path(base: string, folder: string, file: string): string {
  return `${base}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
}

/** Ana sayfa Themes bölümü: kutularda Görsel görseli, tıklanınca tema videosu önizleme */
export function getThemeAssetsForHomepage(): Array<{
  styleKey: string;
  titleKey: string;
  descKey: string;
  themeId: ThemeId;
  /** Landing page kutusunda gösterilecek görsel — Görsel (tema tanıtım görseli) */
  imageUrl: string;
  /** Zarf kapak görseli (davetiye açılış ekranı için) */
  zarfUrl: string;
  /** Tema önizleme videosu — kutu tıklanınca telefon çerçevesinde oynatılır */
  videoUrl: string;
  folderName: string;
}> {
  return THEME_FOLDER_ASSETS.map((t) => ({
    styleKey: t.styleKey,
    titleKey: `${t.styleKey}_title` as 'style_1_title' | 'style_2_title' | 'style_3_title' | 'style_4_title' | 'style_5_title',
    descKey: `${t.styleKey}_desc` as 'style_1_desc' | 'style_2_desc' | 'style_3_desc' | 'style_4_desc' | 'style_5_desc',
    themeId: t.themeId,
    folderName: t.folderName,
    imageUrl: path(BASE, t.folderName, `Görsel.${t.görselExt}`),
    zarfUrl: path(BASE, t.folderName, `Zarf.${t.zarfExt}`),
    videoUrl: videoUrl(t.folderName),
  }));
}

/** styleKey (style_1..style_5) → Görsel, Video, Zarf URL ve themeId */
export function getThemeAssetsByStyleKey(styleKey: string): {
  imageUrl: string;
  videoUrl: string;
  zarfUrl: string;
  themeId: ThemeId;
} | null {
  const t = THEME_FOLDER_ASSETS.find((x) => x.styleKey === styleKey);
  if (!t) return null;
  return {
    imageUrl: path(BASE, t.folderName, `Görsel.${t.görselExt}`),
    videoUrl: videoUrl(t.folderName),
    zarfUrl: path(BASE, t.folderName, `Zarf.${t.zarfExt}`),
    themeId: t.themeId,
  };
}

/** themeId → davetli açılış videosu + zarf kapak görseli */
export function getThemeAssetsByThemeId(themeId: ThemeId): {
  videoUrl: string;
  zarfUrl: string;
  imageUrl: string;
} {
  const t = THEME_FOLDER_ASSETS.find((x) => x.themeId === themeId) ?? THEME_FOLDER_ASSETS[0];
  return {
    videoUrl: videoUrl(t.folderName),
    zarfUrl: path(BASE, t.folderName, `Zarf.${t.zarfExt}`),
    imageUrl: path(BASE, t.folderName, `Görsel.${t.görselExt}`),
  };
}

/** templateId (style_1 | style_2 | ...) → ThemeId - customize sayfası için */
export function getThemeIdFromTemplateId(templateId: string): ThemeId {
  const assets = getThemeAssetsByStyleKey(templateId);
  return assets?.themeId ?? 'elegant';
}
