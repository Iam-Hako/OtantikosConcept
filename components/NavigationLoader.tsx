'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPill, setShowPill] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pillTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or searchParams change, route navigation has completed!
  useEffect(() => {
    // Finish progress bar smoothly
    setProgress(100);
    
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setShowPill(false);
      setProgress(0);
    }, 280);

    return () => {
      clearTimeout(timeout);
    };
  }, [pathname, searchParams]);

  // Intercept internal link clicks to trigger instant visual feedback
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find nearest <a> tag
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');
      const download = target.getAttribute('download');

      // Ignore external, download, new tab, hash anchors, or javascript links
      if (
        !href ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('tel:') ||
        href.startsWith('mailto:') ||
        href.startsWith('javascript:') ||
        href.startsWith('#') ||
        targetAttr === '_blank' ||
        download !== null ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // Check if navigating to the exact same URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start the loading animation!
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pillTimerRef.current) clearTimeout(pillTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      setIsLoading(true);
      setProgress(15);

      // Smooth simulated progress trickle
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            return prev;
          }
          const step = Math.max(1, (90 - prev) * 0.12);
          return Math.min(88, prev + step);
        });
      }, 100);

      // Show floating branded badge if navigation takes > 120ms
      pillTimerRef.current = setTimeout(() => {
        setShowPill(true);
      }, 120);
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pillTimerRef.current) clearTimeout(pillTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* 1. Top Sleek Golden Shimmer Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3.5px] bg-transparent overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all ease-out duration-200 relative"
          style={{
            width: `${progress}%`,
            opacity: progress === 100 ? 0 : 1,
            boxShadow: '0 0 16px 2px rgba(245, 158, 11, 0.9), 0 0 8px 1px rgba(251, 191, 36, 0.8)',
          }}
        >
          {/* Animated Glowing Head Particle */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/90 blur-[1px]" />
        </div>
      </div>

      {/* 2. Floating Branded Animated Loading Badge (Smooth Fade In/Out) */}
      <div
        className={`fixed bottom-6 sm:bottom-8 right-6 z-[99998] pointer-events-none transition-all duration-300 transform ${
          showPill && isLoading
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-3 scale-95'
        }`}
        aria-hidden="true"
      >
        <div className="bg-stone-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/40 shadow-2xl shadow-amber-950/40 flex items-center gap-3">
          
          {/* Pulsing Logo Emblem */}
          <div className="relative w-7 h-7 rounded-xl bg-stone-800 border border-amber-500/40 p-1 flex items-center justify-center shrink-0">
            <Image 
              src="/images/logo.webp" 
              alt="Otantikos" 
              width={20} 
              height={20} 
              className="object-contain animate-pulse" 
            />
            {/* Spinning Ring */}
            <div className="absolute -inset-1 rounded-xl border border-amber-400/50 border-t-transparent animate-spin" />
          </div>

          {/* Shimmering Text */}
          <div className="flex flex-col pr-1">
            <div className="flex items-center gap-1">
              <span className="font-serif font-black text-xs text-amber-300 tracking-wide">
                Otantikos Concept
              </span>
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <span className="text-[10px] text-stone-300 font-medium">
              Sayfa hazırlanıyor...
            </span>
          </div>

        </div>
      </div>
    </>
  );
}
