'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { SupportedLanguage, LanguageInfo, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './types';
import { translations } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  languages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'otantikos_lang';

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);

  // Sync language preferences on client mount & clean up any legacy translation artifacts
  useEffect(() => {
    try {
      // 1. Remove any legacy Google Translate cookies or DOM containers
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      const oldGt = document.getElementById('google_translate_element');
      if (oldGt) oldGt.remove();
      const oldScript = document.getElementById('google-translate-script');
      if (oldScript) oldScript.remove();

      // 2. Check localStorage
      const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored) && stored !== language) {
        setLanguageState(stored);
        applyDocumentLanguage(stored);
        return;
      }

      // 3. Otherwise ensure document matches current active language
      applyDocumentLanguage(language);
    } catch {
      // Ignore storage errors
    }
  }, [language]);

  const applyDocumentLanguage = (lang: SupportedLanguage) => {
    if (typeof document === 'undefined') return;
    const isAr = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    if (isAr) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }

    // Set cookie for Server-Side Rendering (SSR) recognition
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {}
    applyDocumentLanguage(newLang);

    // Notify listeners without full page reload or DOM hijacking
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('otantikos:language_changed', {
          detail: { language: newLang, isRTL: newLang === 'ar' },
        })
      );
    }
  }, []);

  const isRTL = language === 'ar';

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const langDict = translations[language];
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      // Fallback to Turkish
      const trDict = translations.tr;
      if (trDict && trDict[key]) {
        return trDict[key];
      }
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageInfo,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
