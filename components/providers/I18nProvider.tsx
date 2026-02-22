'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { i18n, Language, I18nKey } from '@/lib/i18n';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: I18nKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'corvus_lang';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'tr'; // Default to Turkish for SSR
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'tr' || stored === 'en') {
    return stored;
  }
  
  // Try to detect from browser
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('tr')) {
    return 'tr';
  }
  
  return 'tr'; // Default to Turkish
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with 'tr' to match SSR, then update on client mount
  const [lang, setLangState] = useState<Language>('tr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only after client-side mount, read from localStorage
    setMounted(true);
    const initialLang = getInitialLanguage();
    setLangState(initialLang);
  }, []);

  useEffect(() => {
    // Sync with localStorage only after mount
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, [lang, mounted]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang);
    }
  };

  const t = (key: I18nKey): string => {
    return i18n[lang][key] || i18n.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

