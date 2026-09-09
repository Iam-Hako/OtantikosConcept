'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { HomeBanner } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';

interface HeroBannerSliderProps {
  initialBanners?: HomeBanner[];
}

export default function HeroBannerSlider({ initialBanners }: HeroBannerSliderProps) {
  const [banners, setBanners] = useState<HomeBanner[]>(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialBanners || initialBanners.length === 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch banners from DataService if not provided initially
  useEffect(() => {
    let isMounted = true;
    async function fetchBanners() {
      try {
        const data = await DataService.getHomeBanners();
        if (isMounted && data && data.length > 0) {
          setBanners(data);
        }
      } catch (err) {
        console.error('Failed to load hero banners:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!initialBanners || initialBanners.length === 0) {
      fetchBanners();
    }
    return () => {
      isMounted = false;
    };
  }, [initialBanners]);

  const nextSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Autoplay interval (5.5 seconds)
  useEffect(() => {
    if (banners.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused, nextSlide]);

  if (isLoading) {
    return (
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="w-full aspect-[21/9] min-h-[240px] sm:min-h-[340px] lg:min-h-[440px] rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-r from-rose-100 via-amber-50 to-orange-100 animate-pulse border border-amber-200/50" />
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 pt-2">
      <div
        className="relative group overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-amber-200/60 shadow-xl shadow-orange-950/[0.04] bg-stone-100 select-none aspect-[16/7] min-h-[220px] sm:min-h-[340px] lg:min-h-[440px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Slides Container */}
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={banner.id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background gradient if specified */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${
                  banner.bg_gradient || 'from-rose-50 via-sky-50 to-amber-50'
                }`}
              />

              {/* Main Banner Image */}
              {banner.image_url && (
                <div className="absolute inset-0">
                  <Image
                    src={banner.image_url}
                    alt={banner.title || 'Afiş'}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 1840px"
                    className="object-cover object-center"
                  />
                </div>
              )}

              {/* Content Overlay (if title or button exists and user wants overlay content) */}
              {(banner.title || banner.button_text) && (
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-stone-900/60 via-stone-900/20 to-transparent flex items-end sm:items-center p-5 sm:p-10 lg:p-14">
                  <div className="max-w-xl space-y-3 sm:space-y-4 text-white">
                    {banner.badge_text && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-rose-500 text-white shadow-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        {banner.badge_text}
                      </span>
                    )}

                    {banner.title && (
                      <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-md text-white">
                        {banner.title}
                      </h2>
                    )}

                    {banner.subtitle && (
                      <p className="text-xs sm:text-base font-medium text-stone-100/90 line-clamp-2 max-w-md drop-shadow">
                        {banner.subtitle}
                      </p>
                    )}

                    {banner.button_text && (
                      <div className="pt-1">
                        <Link
                          href={banner.button_url || '/kategori/tum-urunler'}
                          className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                          <span>{banner.button_text}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Entire slide clickable if no inner button */}
              {!banner.button_text && (
                <Link
                  href={banner.button_url || '/kategori/tum-urunler'}
                  className="absolute inset-0 z-10"
                  aria-label={banner.title || 'Banner'}
                />
              )}
            </div>
          );
        })}

        {/* Previous Slide Navigation Arrow (Miniso style circular button) */}
        {banners.length > 1 && (
          <button
            onClick={prevSlide}
            aria-label="Önceki Afiş"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-stone-800 hover:text-rose-600 backdrop-blur-md shadow-lg border border-white/60 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Next Slide Navigation Arrow (Miniso style circular button) */}
        {banners.length > 1 && (
          <button
            onClick={nextSlide}
            aria-label="Sonraki Afiş"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-stone-800 hover:text-rose-600 backdrop-blur-md shadow-lg border border-white/60 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Miniso Style Pill Pagination Dots (Bottom Center) */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20">
            {banners.map((_, dotIdx) => {
              const isDotActive = dotIdx === currentIndex;
              return (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Afiş ${dotIdx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isDotActive
                      ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-rose-500 shadow-sm'
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/70 hover:bg-white'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
