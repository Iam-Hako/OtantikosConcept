'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/language-context';
import { SupportedLanguage } from '@/lib/i18n/types';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'mobile' | 'footer';
  className?: string;
}

export default function LanguageSelector({ variant = 'navbar', className = '' }: LanguageSelectorProps) {
  const router = useRouter();
  const { language, setLanguage, languages, currentLanguageInfo } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
    try {
      router.refresh();
    } catch {}
  };

  // ==========================================
  // 1. MOBILE DRAWER VARIANT (Grid / Pill list)
  // ==========================================
  if (variant === 'mobile') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
          <Globe className="w-3.5 h-3.5 text-stone-400" />
          <span>Dil Seçimi / Language / اللغة</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {languages.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectLanguage(item.code)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition active:scale-98 min-h-[44px] cursor-pointer ${
                  isSelected
                    ? 'bg-red-50/70 border-[#e60012] text-[#e60012] font-bold shadow-2xs'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200/80 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{item.flag}</span>
                  <div className="text-left">
                    <div className="leading-tight text-xs">{item.nativeName}</div>
                    <div className="text-[10px] text-stone-400 font-mono uppercase">{item.code}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#e60012] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. FOOTER VARIANT (Clean pill with upward dropdown)
  // ==========================================
  if (variant === 'footer') {
    return (
      <div className={`relative inline-block ${className}`} ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-xs font-bold text-stone-800 transition active:scale-98 min-h-[40px] cursor-pointer"
          aria-label="Dil Değiştir"
          aria-expanded={isOpen}
        >
          <Globe className="w-4 h-4 text-stone-500" />
          <span className="text-sm select-none">{currentLanguageInfo.flag}</span>
          <span>{currentLanguageInfo.nativeName}</span>
          <span className="text-[10px] text-stone-500 font-mono uppercase">({currentLanguageInfo.code})</span>
          <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2 z-50 animate-scale-in">
            <div className="px-3.5 py-2 border-b border-stone-100 text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
              <span>Dil Seçin / Select Language</span>
              <Globe className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
              {languages.map((item) => {
                const isSelected = item.code === language;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 text-[#e60012] font-bold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base select-none">{item.flag}</span>
                      <span className="font-semibold">{item.nativeName}</span>
                      <span className="text-[10px] text-stone-400">({item.name})</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#e60012]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 3. NAVBAR VARIANT (Desktop Header Dropdown)
  // ==========================================
  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-semibold transition active:scale-98 min-h-[36px] sm:min-h-[38px] cursor-pointer"
        aria-label="Dil Seçimi"
        aria-expanded={isOpen}
      >
        <span className="text-sm select-none">{currentLanguageInfo.flag}</span>
        <span className="font-mono text-[11px] uppercase tracking-wide font-bold">{currentLanguageInfo.code}</span>
        <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2 z-50 animate-scale-in">
          <div className="px-3.5 py-1.5 border-b border-stone-100 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            <span>Diller / Languages / اللغات</span>
            <Globe className="w-3.5 h-3.5 text-stone-400" />
          </div>

          <div className="p-1.5 space-y-0.5">
            {languages.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-red-50 text-[#e60012] font-bold'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base select-none">{item.flag}</span>
                    <div className="text-left">
                      <div className="font-semibold text-xs leading-tight">{item.nativeName}</div>
                      <div className="text-[10px] text-stone-400 leading-tight">{item.name}</div>
                    </div>
                  </div>
                  {item.dir === 'rtl' && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded font-mono font-bold mr-1">
                      RTL
                    </span>
                  )}
                  {isSelected && <Check className="w-4 h-4 text-[#e60012] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
