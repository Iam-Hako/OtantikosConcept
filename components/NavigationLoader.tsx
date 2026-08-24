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

  const prevPathRef = useRef(pathname + (searchParams?.toString() || ''));
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or searchParams change, route transition is finished
  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() || '');
    if (prevPathRef.current !== currentPath) {
      prevPathRef.current = currentPath;

      // Complete progress smoothly
      setProgress(100);
      setIsFadingOut(true);

      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      finishTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsFadingOut(false);
        setProgress(0);
      }, 200);
    }
  }, [pathname, searchParams]);

  // Listen to navigation link clicks safely (non-blocking)
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

      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      setIsFadingOut(false);
      setIsVisible(true);
      setProgress(30);

      // Smooth progress animation
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            return prev;
          }
          const step = Math.max(2, (92 - prev) * 0.2);
          return Math.min(90, prev + step);
        });
      }, 60);
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] pointer-events-none flex flex-col items-center justify-center transition-opacity duration-200 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* 1. Backdrop Glow */}
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity duration-200" />

      {/* 2. Top Glowing Golden Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-stone-900/40 overflow-hidden z-50">
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all ease-out duration-150 relative"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 16px 3px rgba(245, 158, 11, 0.9), 0 0 8px 1px rgba(251, 191, 36, 0.8)',
          }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/90 blur-[1px]" />
        </div>
      </div>

      {/* 3. Centered Luxury Otantikos Animated Emblem & Typography */}
      <div className="relative z-10 flex flex-col items-center space-y-5 px-6 text-center">
        
        {/* Animated Emblem Container */}
        <div className="relative flex items-center justify-center">
          {/* Ambient Golden Glow Halo */}
          <div className="absolute -inset-6 rounded-full bg-amber-500/25 blur-2xl animate-pulse" />
          
          {/* Outer Spinning Golden Ring */}
          <div 
            className="absolute -inset-3 rounded-2xl border-2 border-amber-500/30 border-t-amber-400 border-r-amber-300 animate-spin" 
            style={{ animationDuration: '1.4s' }} 
          />

          {/* Core Logo Card */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-900/95 border border-amber-500/60 p-2.5 flex items-center justify-center shadow-2xl shadow-amber-950/80">
            <Image
              src="/images/logo.webp"
              alt="Otantikos Concept"
              width={54}
              height={54}
              className="object-contain animate-pulse"
              priority
            />
          </div>
        </div>

        {/* Brand Text & Status */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-stone-900/90 border border-amber-500/40 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-xs font-serif font-black tracking-widest text-amber-300">
              OTANTİKOS CONCEPT
            </span>
          </div>

          <div className="flex items-center justify-center gap-1 text-[11px] text-stone-300 font-medium">
            <span>Yükleniyor</span>
            <span className="inline-flex gap-1 ml-0.5">
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
