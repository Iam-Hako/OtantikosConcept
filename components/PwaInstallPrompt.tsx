'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already in standalone mode (already installed and opened as app)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isInStandaloneMode);
    if (isInStandaloneMode) return;

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem('otantikos_pwa_dismissed_at');
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 5) return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    // Android / Desktop Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after 6 seconds of browsing
      setTimeout(() => {
        setIsVisible(true);
      }, 6000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS Safari, show prompt after 8 seconds
    if (isIosDevice && !isInStandaloneMode) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 8000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('otantikos_pwa_dismissed_at', String(Date.now()));
  };

  if (!isVisible || isStandalone) {
    return null;
  }

  return (
    <aside
      aria-label="Uygulamayı Yükle"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-40 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-stone-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-stone-700/80 relative overflow-hidden backdrop-blur-md">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 text-stone-400 hover:text-white rounded-full transition cursor-pointer"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* App Icon */}
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-stone-700 shadow-md bg-stone-950">
            <Image
              src="/icons/icon-192.png"
              alt="Otantikos App"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1 pr-4 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#e60012]">Mobil Uygulama</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-bold">Hızlı</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">
              Otantikos'u Telefona Yükleyin
            </h4>
            <p className="text-[11px] text-stone-400 leading-snug">
              Tek dokunuşla ana ekranınızdan açın, kesintisiz ve hızlı alışveriş yapın.
            </p>
          </div>
        </div>

        {/* Action Guide: Android (Direct Install) vs iOS (Add to Home Screen) */}
        <div className="mt-3.5 pt-3 border-t border-stone-800">
          {isIos ? (
            // iOS Instructions
            <div className="space-y-2 text-[11px] text-stone-300">
              <div className="flex items-center gap-2 bg-stone-800/80 p-2 rounded-xl">
                <Share className="w-4 h-4 text-sky-400 shrink-0" />
                <span>1. Safari alt menüsündeki <strong>Paylaş</strong> simgesine dokunun.</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-800/80 p-2 rounded-xl">
                <PlusSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2. Listeden <strong>&quot;Ana Ekrana Ekle&quot;</strong> seçeneğini seçin.</span>
              </div>
            </div>
          ) : (
            // Android Install Button
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-2.5 px-4 bg-[#e60012] hover:bg-[#c90010] active:scale-98 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Uygulamayı Şimdi Yükle</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
