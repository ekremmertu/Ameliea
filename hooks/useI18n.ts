/**
 * Simple i18n hook
 * Returns identity function for now (no translation)
 */

export function useI18n() {
  // For now, just return the fallback text
  // TODO: Implement full i18n with translation files
  const t = (key: string, fallback?: string) => fallback || key;
  
  return { t };
}
