'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('otantikos_cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem('otantikos_cookie_consent', 'accepted');
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-stone-900/95 backdrop-blur-md text-stone-200 border-t border-stone-800 shadow-2xl animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-start sm:items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            Sizlere daha iyi bir alışveriş deneyimi sunmak, güvenliği sağlamak ve site trafiğini analiz etmek için çerezleri (cookies) kullanıyoruz. Detaylı bilgi için{' '}
            <Link href="/cerez-politikasi" className="text-amber-400 underline hover:text-amber-300">
              Çerez Politikası
            </Link>{' '}
            ve{' '}
            <Link href="/kvkk" className="text-amber-400 underline hover:text-amber-300">
              KVKK Aydınlatma Metni
            </Link>
            'mizi inceleyebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={acceptCookies}
            className="w-full sm:w-auto px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm transition"
          >
            Kabul Ediyorum
          </button>
        </div>
      </div>
    </div>
  );
}
