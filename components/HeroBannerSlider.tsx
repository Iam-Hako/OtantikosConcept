'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { HomeBanner } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { useAuth } from '@/lib/store/auth-context';

interface HeroBannerSliderProps {
  initialBanners?: HomeBanner[];
}

export default function HeroBannerSlider({ initialBanners }: HeroBannerSliderProps) {
  const { isAdmin } = useAuth();
  const [banners, setBanners] = useState<HomeBanner[]>(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialBanners || initialBanners.length === 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch swipe tracking
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

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
    <section className="w-full max-w-[1840px] mx-auto px-2 sm:px-6 lg:px-8 pt-1 sm:pt-2">
      <div
        className="relative group overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-stone-200/90 shadow-xl shadow-red-950/[0.04] bg-stone-100 select-none aspect-[4/5] min-h-[420px] sm:aspect-[16/7] sm:min-h-[340px] lg:min-h-[460px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Direct Admin Banner Management Button */}
        {isAdmin && (
          <Link
            href="/admin/bannerlar"
            className="absolute top-3 left-3 sm:top-5 sm:left-5 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-900 text-white text-[11px] sm:text-xs font-bold shadow-lg backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95"
            title="Afişleri ve Görselleri Yönet"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Afişleri Yönet</span>
          </Link>
        )}

        {/* Top Pill Badge if set by Admin (Desktop Only) */}
        {currentBanner?.badge_text && (
          <div className="hidden sm:inline-flex absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 z-20 items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black bg-gradient-to-r from-blue-900 via-indigo-900 to-rose-600 text-white shadow-md border border-white/20 whitespace-nowrap">
            <span className="text-yellow-300">⭐</span>
            <span>{currentBanner.badge_text}</span>
            <span className="text-yellow-300 font-black ml-0.5">›</span>
          </div>
        )}

        {/* Slides Container */}
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Color & Image: Responsive Desktop vs Mobile */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Desktop Image (Landscape) */}
                <Image
                  src={banner.image_url}
                  alt={banner.title || 'Banner'}
                  fill
                  priority={index === 0}
                  className="hidden sm:block object-cover object-center transform scale-100 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 1440px) 95vw, 1840px"
                />
                {/* Mobile Image (Dedicated 4:5 Portrait without clipping) */}
                <Image
                  src={banner.mobile_image_url || banner.image_url}
                  alt={banner.title || 'Banner'}
                  fill
                  priority={index === 0}
                  className="sm:hidden object-cover object-center transform scale-100 transition-transform duration-1000 ease-out"
                  sizes="100vw"
                />
                <div className="hidden sm:block absolute inset-0 sm:bg-gradient-to-r sm:from-black/40 sm:via-transparent sm:to-transparent" />
              </div>

              {/* Desktop Text & Content Overlay */}
              {(banner.title || banner.subtitle) && (
                <div className="hidden sm:flex absolute inset-0 z-10 flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-2xl text-white">
                  <div className="space-y-3 sm:space-y-4">
                    {banner.badge_text && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#e60012] text-white shadow-sm border border-white/20">
                        {banner.badge_text}
                      </span>
                    )}

                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight drop-shadow-md leading-tight">
                      {banner.title}
                    </h2>

                    {banner.subtitle && (
                      <p className="text-xs sm:text-sm lg:text-base font-medium text-white/90 drop-shadow-xs line-clamp-3 sm:line-clamp-none max-w-xl leading-relaxed">
                        {banner.subtitle}
                      </p>
                    )}

                    {banner.button_text && (
                      <div className="pt-2">
                        <Link
                          href={banner.button_url || '/kategori/tum-urunler'}
                          className="inline-flex items-center gap-2.5 px-6 py-3 sm:px-8 sm:py-3.5 rounded-full bg-[#e60012] hover:bg-[#c90010] text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                          <span>{banner.button_text}</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Entire slide is clickable on mobile (and desktop if no inner button) */}
              <Link
                href={banner.button_url || '/kategori/tum-urunler'}
                className="absolute inset-0 z-10 sm:hidden"
                aria-label={banner.title || 'Banner'}
              />
              {!banner.button_text && (
                <Link
                  href={banner.button_url || '/kategori/tum-urunler'}
                  className="hidden sm:block absolute inset-0 z-10"
                  aria-label={banner.title || 'Banner'}
                />
              )}
            </div>
          );
        })}

        {/* Previous Slide Navigation Arrow (Always Visible) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Önceki Afiş"
          className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-stone-800 hover:text-[#e60012] shadow-xl border border-stone-200/80 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Next Slide Navigation Arrow (Always Visible) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Sonraki Afiş"
          className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-stone-800 hover:text-[#e60012] shadow-xl border border-stone-200/80 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Miniso Style Pill Pagination Bars (Bottom Center) */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20">
            {banners.map((_, dotIdx) => {
              const isDotActive = dotIdx === currentIndex;
              return (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Afiş ${dotIdx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isDotActive
                      ? 'w-10 sm:w-14 h-1.5 sm:h-2 bg-[#e60012] shadow-sm'
                      : 'w-6 sm:w-8 h-1.5 sm:h-2 bg-white/70 hover:bg-white'
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
