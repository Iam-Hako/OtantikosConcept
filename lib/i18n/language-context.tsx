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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize language from localStorage / cookie on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        setLanguageState(stored);
        applyDocumentLanguage(stored);
        return;
      }

      // Check cookie
      const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
      if (match && match[1]) {
        const cookieLang = match[1] as SupportedLanguage;
        if (SUPPORTED_LANGUAGES.some((l) => l.code === cookieLang)) {
          setLanguageState(cookieLang);
          applyDocumentLanguage(cookieLang);
          return;
        }
      }

      // Fallback: check browser language
      const browserLang = navigator.language?.slice(0, 2).toLowerCase() as SupportedLanguage;
      if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
        setLanguageState(browserLang);
        applyDocumentLanguage(browserLang);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const applyDocumentLanguage = (lang: SupportedLanguage) => {
    const isAr = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    if (isAr) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }

    // Set cookie for Next.js / server awareness
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;

    // Seamless automated page translation bridge for dynamic texts
    applyPageTranslationBridge(lang);
  };

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {}
    applyDocumentLanguage(newLang);

    // Notify components
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

/**
 * Clean, seamless page translation bridge for dynamic content (product descriptions, reviews, blog posts)
 */
function applyPageTranslationBridge(targetLang: SupportedLanguage) {
  if (typeof window === 'undefined') return;

  const cookieDomain = window.location.hostname;
  if (targetLang === 'tr') {
    // Revert to original
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${cookieDomain}; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${cookieDomain}; path=/;`;

    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select && select.value !== 'tr') {
      select.value = 'tr';
      select.dispatchEvent(new Event('change'));
    }
    return;
  }

  // Set translation cookie
  document.cookie = `googtrans=/tr/${targetLang}; path=/; SameSite=Lax`;
  document.cookie = `googtrans=/tr/${targetLang}; domain=.${cookieDomain}; path=/; SameSite=Lax`;

  // Trigger combo if already initialized
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (select) {
    select.value = targetLang;
    select.dispatchEvent(new Event('change'));
    return;
  }

  // Dynamically load Google Translate script if not loaded yet
  if (!document.getElementById('google-translate-script')) {
    (window as any).googleTranslateElementInit = function () {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'tr',
          includedLanguages: 'tr,en,ar,ru,de,fr,es',
          autoDisplay: false,
        },
        'google_translate_element'
      );

      // Trigger after init
      setTimeout(() => {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo && combo.value !== targetLang) {
          combo.value = targetLang;
          combo.dispatchEvent(new Event('change'));
        }
      }, 300);
    };

    const container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.display = 'none';
    document.body.appendChild(container);

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }
}
