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
      className={`fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3.5px] transition-opacity duration-200 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 transition-all ease-out duration-150 relative"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 12px 2px rgba(249, 115, 22, 0.8), 0 0 6px 1px rgba(245, 158, 11, 0.9)',
        }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/80 blur-[1px]" />
      </div>
    </div>
  );
}
