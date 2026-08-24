'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  const startTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or searchParams change, route transition has arrived
  useEffect(() => {
    if (!isVisible && !isFadingOut) return;

    // Fast finish to 100%
    setProgress(100);

    // Smooth fade out
    setIsFadingOut(true);
    finishTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsFadingOut(false);
      setProgress(0);
    }, 320);

    return () => {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, [pathname, searchParams]);

  // Intercept all internal navigation link clicks
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');
      const download = target.getAttribute('download');

      // Ignore external, tel, mailto, anchor, download, or modifier keys
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

      // Check if clicking current active route
      const currentPath = window.location.pathname + window.location.search;
      if (href === currentPath) return;

      // Start full-screen loading overlay
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      setIsFadingOut(false);
      setIsVisible(true);
      setProgress(20);

      // Smooth progress animation
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            return prev;
          }
          const step = Math.max(1, (92 - prev) * 0.15);
          return Math.min(90, prev + step);
        });
      }, 80);

      // Safety timeout: Automatically dismiss after 4 seconds to never trap the user
      safetyTimerRef.current = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsVisible(false);
          setIsFadingOut(false);
          setProgress(0);
        }, 300);
      }, 4000);
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-stone-950/80 backdrop-blur-md transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ willChange: 'opacity' }}
      aria-label="Yükleniyor"
      role="status"
    >
      {/* 1. Top Glowing Golden Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[4px] bg-stone-900/50 overflow-hidden z-50">
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all ease-out duration-150 relative"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 20px 3px rgba(245, 158, 11, 0.95), 0 0 10px 1px rgba(251, 191, 36, 0.9)',
          }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-r from-transparent to-white/95 blur-[1px]" />
        </div>
      </div>

      {/* 2. Centered Luxury Otantikos Animated Emblem & Typography */}
      <div className="flex flex-col items-center space-y-6 px-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Animated Emblem Container */}
        <div className="relative flex items-center justify-center">
          {/* Ambient Golden Glow Halo */}
          <div className="absolute -inset-8 rounded-full bg-amber-500/25 blur-2xl animate-pulse" />
          
          {/* Outer Spinning Golden Ring */}
          <div 
            className="absolute -inset-3 sm:-inset-4 rounded-3xl border-2 border-amber-500/30 border-t-amber-400 border-r-amber-300 animate-spin" 
            style={{ animationDuration: '1.6s' }} 
          />

          {/* Inner Counter-Rotating Golden Ring */}
          <div 
            className="absolute -inset-1 rounded-2xl border border-amber-400/40 border-b-amber-300 border-l-transparent animate-spin" 
            style={{ animationDuration: '2.4s', animationDirection: 'reverse' }} 
          />

          {/* Core Logo Card */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-stone-900/95 border border-amber-500/60 p-3 flex items-center justify-center shadow-2xl shadow-amber-950/80">
            <Image
              src="/images/logo.webp"
              alt="Otantikos Concept"
              width={64}
              height={64}
              className="object-contain animate-pulse"
              priority
            />
          </div>
        </div>

        {/* Brand Text & Status */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-xs sm:text-sm font-serif font-black tracking-widest text-amber-300">
              OTANTİKOS CONCEPT
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-stone-300 font-medium">
            <span>Yükleniyor</span>
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
