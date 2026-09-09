'use client';

import React from 'react';

export type LogoConcept = 'smile-bag' | 'gift-ribbon' | 'kawaii-mascot';

interface LogoProps {
  concept?: LogoConcept;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isDark?: boolean;
}

export default function Logo({
  concept = 'smile-bag',
  size = 'md',
  showText = true,
  className = '',
  isDark = false,
}: LogoProps) {
  // Dimension definitions
  const dimensions = {
    xs: { icon: 'w-7 h-7', title: 'text-sm', sub: 'text-[7px]' },
    sm: { icon: 'w-9 h-9', title: 'text-base', sub: 'text-[8px]' },
    md: { icon: 'w-10 h-10 sm:w-11 sm:h-11', title: 'text-lg sm:text-xl', sub: 'text-[9px]' },
    lg: { icon: 'w-14 h-14 sm:w-16 sm:h-16', title: 'text-2xl sm:text-3xl', sub: 'text-xs' },
    xl: { icon: 'w-20 h-20 sm:w-24 sm:h-24', title: 'text-3xl sm:text-4xl', sub: 'text-sm' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* LOGO ICON EMBLEM */}
      <div 
        className={`${dimensions.icon} shrink-0 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-xs`}
        title="Otantikos Concept"
      >
        {concept === 'smile-bag' && <SmileBagIcon />}
        {concept === 'gift-ribbon' && <GiftRibbonIcon />}
        {concept === 'kawaii-mascot' && <KawaiiMascotIcon />}
      </div>

      {/* LOGO TYPOGRAPHY */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1">
            <span 
              className={`font-sans font-black tracking-tight ${dimensions.title} ${
                isDark ? 'text-white' : 'text-stone-900 group-hover:text-[#e60012]'
              } transition-colors`}
            >
              Otantikos
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e60012] animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
            <span className={`font-black text-[#e60012] tracking-[0.22em] uppercase ${dimensions.sub}`}>
              CONCEPT
            </span>
            <span className={`text-[8px] font-bold text-stone-300 ${size === 'xs' || size === 'sm' ? 'hidden' : 'inline-block'}`}>
              •
            </span>
            <span className={`text-[9px] font-medium text-stone-400 tracking-wide ${size === 'xs' || size === 'sm' ? 'hidden' : 'inline-block'}`}>
              TAHTAKALE
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Concept 1: The Iconic Miniso-Style Cute Shopping Bag with Smile & Sparkle
 */
export function SmileBagIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="otantikosRedGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#c90010" />
        </linearGradient>
      </defs>

      {/* Red Shopping Bag Body */}
      <rect x="4" y="11" width="40" height="34" rx="10" fill="url(#otantikosRedGrad)" />
      
      {/* Bag Handle (Top Arch) */}
      <path 
        d="M17 12V8C17 5 19.5 3 22.5 3H25.5C28.5 3 31 5 31 8V12" 
        stroke="white" 
        strokeWidth="2.8" 
        strokeLinecap="round" 
      />

      {/* Kawaii Eyes (Happy Arcs) */}
      <path 
        d="M15.5 24C16.3 22.2 18.7 22.2 19.5 24" 
        stroke="white" 
        strokeWidth="2.4" 
        strokeLinecap="round" 
      />
      <path 
        d="M28.5 24C29.3 22.2 31.7 22.2 32.5 24" 
        stroke="white" 
        strokeWidth="2.4" 
        strokeLinecap="round" 
      />

      {/* Sweet Smile */}
      <path 
        d="M20 29C21.2 32 26.8 32 28 29" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />

      {/* Cute Rosy Cheeks */}
      <circle cx="15" cy="27.5" r="1.6" fill="#ffb4b9" opacity="0.95" />
      <circle cx="33" cy="27.5" r="1.6" fill="#ffb4b9" opacity="0.95" />

      {/* Sparkle Star at Top Right */}
      <path 
        d="M37 14L38 16.5L40.5 17.5L38 18.5L37 21L36 18.5L33.5 17.5L36 16.5L37 14Z" 
        fill="white" 
        opacity="0.95"
      />
    </svg>
  );
}

/**
 * Concept 2: The Modern "O" Monogram with Ribbon / Gift Loop
 */
export function GiftRibbonIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="ribbonGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff2a38" />
          <stop offset="1" stopColor="#b8000e" />
        </linearGradient>
      </defs>

      {/* Rounded Emblem Badge */}
      <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#ribbonGrad)" />

      {/* Stylized 'O' Circle */}
      <circle cx="24" cy="26" r="12" stroke="white" strokeWidth="4" />
      
      {/* Gift Ribbon Bow on Top of 'O' */}
      <path 
        d="M18 14C15 10 18 6 22 9C23.5 10.5 24 14 24 14C24 14 24.5 10.5 26 9C30 6 33 10 30 14" 
        stroke="white" 
        strokeWidth="2.6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="24" cy="14" r="2.2" fill="white" />
    </svg>
  );
}

/**
 * Concept 3: The Kawaii Plush Bear / Mascot Silhouette
 */
export function KawaiiMascotIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="mascotGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#c90010" />
        </linearGradient>
      </defs>

      {/* Badge */}
      <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#mascotGrad)" />

      {/* Bear Ears */}
      <circle cx="15" cy="15" r="4.5" fill="white" />
      <circle cx="33" cy="15" r="4.5" fill="white" />
      <circle cx="15" cy="15" r="2.5" fill="#ff1725" />
      <circle cx="33" cy="15" r="2.5" fill="#ff1725" />

      {/* Bear Head */}
      <circle cx="24" cy="26" r="13" fill="white" />

      {/* Eyes */}
      <circle cx="19" cy="24" r="1.8" fill="#1c1917" />
      <circle cx="29" cy="24" r="1.8" fill="#1c1917" />

      {/* Snout & Nose */}
      <ellipse cx="24" cy="28.5" rx="4.5" ry="3.2" fill="#fef2f2" />
      <ellipse cx="24" cy="27.5" rx="1.8" ry="1.2" fill="#1c1917" />
      <path d="M22.5 29.5C23.2 30.5 24.8 30.5 25.5 29.5" stroke="#1c1917" strokeWidth="1" strokeLinecap="round" />

      {/* Cheeks */}
      <circle cx="16.5" cy="26.5" r="1.5" fill="#f87171" opacity="0.7" />
      <circle cx="31.5" cy="26.5" r="1.5" fill="#f87171" opacity="0.7" />
    </svg>
  );
}
