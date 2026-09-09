'use client';

import React from 'react';

export type LogoConcept = 'round-seal' | 'round-monogram' | 'round-minimal' | 'smile-bag';

interface LogoProps {
  concept?: LogoConcept;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isDark?: boolean;
}

export default function Logo({
  concept = 'round-seal',
  size = 'md',
  showText = true,
  className = '',
  isDark = false,
}: LogoProps) {
  // Dimension definitions
  const dimensions = {
    xs: { icon: 'w-7 h-7', title: 'text-sm', sub: 'text-[7px]', badge: 'text-[6px]' },
    sm: { icon: 'w-9 h-9', title: 'text-base', sub: 'text-[8px]', badge: 'text-[7px]' },
    md: { icon: 'w-10 h-10 sm:w-11 sm:h-11', title: 'text-lg sm:text-xl', sub: 'text-[9px]', badge: 'text-[8px]' },
    lg: { icon: 'w-14 h-14 sm:w-16 sm:h-16', title: 'text-2xl sm:text-3xl', sub: 'text-xs', badge: 'text-[10px]' },
    xl: { icon: 'w-20 h-20 sm:w-24 sm:h-24', title: 'text-3xl sm:text-4xl', sub: 'text-sm', badge: 'text-xs' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* CIRCULAR COMPANY LOGO EMBLEM */}
      <div 
        className={`${dimensions.icon} shrink-0 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-xs`}
        title="Otantikos Concept Şirket Logosu"
      >
        {concept === 'round-seal' && <RoundSealIcon />}
        {concept === 'round-monogram' && <RoundMonogramIcon />}
        {concept === 'round-minimal' && <RoundMinimalIcon />}
        {concept === 'smile-bag' && <RoundMinimalIcon />}
      </div>

      {/* CORPORATE TYPOGRAPHY */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span 
              className={`font-sans font-black tracking-tight ${dimensions.title} ${
                isDark ? 'text-white' : 'text-stone-900 group-hover:text-[#e60012]'
              } transition-colors uppercase`}
            >
              Otantikos
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e60012] animate-pulse" />
          </div>
          
          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
            <span className={`font-black text-[#e60012] tracking-[0.25em] uppercase ${dimensions.sub}`}>
              CONCEPT
            </span>
            <span className={`text-[8px] font-bold text-stone-300 ${size === 'xs' || size === 'sm' ? 'hidden' : 'inline-block'}`}>
              •
            </span>
            <span className={`font-bold text-stone-400 tracking-wider uppercase ${dimensions.badge} ${size === 'xs' || size === 'sm' ? 'hidden' : 'inline-block'}`}>
              LTD. ŞTİ.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Concept 1: Dairesel Kurumsal Şirket Arması / Mühür (Round Seal)
 * Çift halkalı resmi şirket amblemi, çember üzerinde OTANTIKOS CONCEPT ve EST. 2024 yazısı, merkezde geometrik 'O' amblemi ve parıltı yıldızı.
 */
export function RoundSealIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="corpRedGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#b8000e" />
        </linearGradient>

        {/* Text Paths along Circle */}
        <path id="sealPathTop" d="M 6.5,24 A 17.5,17.5 0 0,1 41.5,24" fill="none" />
        <path id="sealPathBottom" d="M 41.5,24 A 17.5,17.5 0 0,1 6.5,24" fill="none" />
      </defs>

      {/* Outer Solid Red Circle */}
      <circle cx="24" cy="24" r="23" fill="url(#corpRedGrad)" />

      {/* Outer Fine White Accent Ring */}
      <circle cx="24" cy="24" r="21" stroke="white" strokeWidth="1" strokeOpacity="0.85" />

      {/* Inner Framing Circle */}
      <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="1" strokeOpacity="0.75" />

      {/* Circular Curving Text: OTANTIKOS (Top Arc) */}
      <text fill="white" fontSize="4.1" fontWeight="900" letterSpacing="0.9">
        <textPath href="#sealPathTop" startOffset="50%" textAnchor="middle">
          OTANTIKOS
        </textPath>
      </text>

      {/* Circular Curving Text: CONCEPT • 2024 (Bottom Arc) */}
      <text fill="white" fontSize="3.6" fontWeight="800" letterSpacing="0.8">
        <textPath href="#sealPathBottom" startOffset="50%" textAnchor="middle">
          CONCEPT • 2024
        </textPath>
      </text>

      {/* Flanking Stars */}
      <path d="M 6.5,23.5 L 7.5,24.5 L 8.5,23.5 L 7.5,22.5 Z" fill="white" />
      <path d="M 41.5,23.5 L 42.5,24.5 L 43.5,23.5 L 42.5,22.5 Z" fill="white" />

      {/* Center Core: Bold Geometric "O" Monogram & 4-Point Star */}
      <circle cx="24" cy="24" r="9" stroke="white" strokeWidth="2.4" fill="none" />
      <path 
        d="M 24,19 L 25.2,22.8 L 29,24 L 25.2,25.2 L 24,29 L 22.8,25.2 L 19,24 L 22.8,22.8 Z" 
        fill="white" 
      />
    </svg>
  );
}

/**
 * Concept 2: Prestij "OC" İkili Monogram Mühür (Round Monogram)
 * Lüks kurumsal retail markaları tarzında, iç içe geçen modern geometrik "O" ve "C" harfleri, çift halka bordür ve merkez pırlanta.
 */
export function RoundMonogramIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="monogramGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff2434" />
          <stop offset="1" stopColor="#a3000d" />
        </linearGradient>
      </defs>

      {/* Outer Red Badge */}
      <circle cx="24" cy="24" r="23" fill="url(#monogramGrad)" />

      {/* Double Concentric Rings */}
      <circle cx="24" cy="24" r="20.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.9" />
      <circle cx="24" cy="24" r="18.5" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="3 2" />

      {/* Outer Bold "O" */}
      <circle cx="24" cy="24" r="13" stroke="white" strokeWidth="3.2" fill="none" />

      {/* Interlinked "C" Letter Arc inside "O" */}
      <path 
        d="M 27.5,16.5 C 20,16.5 16,19.8 16,24 C 16,28.2 20,31.5 27.5,31.5" 
        stroke="white" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        fill="none" 
      />

      {/* Central Diamond Accent */}
      <path d="M 24,21 L 26,24 L 24,27 L 22,24 Z" fill="white" />

      {/* North / South Pinpoint Markers */}
      <circle cx="24" cy="7.5" r="1.2" fill="white" />
      <circle cx="24" cy="40.5" r="1.2" fill="white" />
    </svg>
  );
}

/**
 * Concept 3: Modern Geometrik Şirket Amblemi (Round Minimal)
 * Sade, şık, global şirket kimliği. Kalın kırmızı zemin, beyaz negatif alanlı modern dairesel ikon ve merkez odak noktası.
 */
export function RoundMinimalIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="minimalRoundGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff1725" />
          <stop offset="1" stopColor="#b8000e" />
        </linearGradient>
      </defs>

      {/* Clean Circular Emblem */}
      <circle cx="24" cy="24" r="23" fill="url(#minimalRoundGrad)" />

      {/* Bold Circular Ring with Stylized Dynamic Cutout */}
      <circle 
        cx="24" 
        cy="24" 
        r="14" 
        stroke="white" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeDasharray="72 16"
        transform="rotate(-45 24 24)"
      />

      {/* Central Solid Core Circle & Star Sparkle */}
      <circle cx="24" cy="24" r="5" fill="white" />
      <circle cx="24" cy="24" r="2.5" fill="#b8000e" />

      {/* Subtle Top Accent Star */}
      <path d="M 24,5.5 L 24.8,7.2 L 26.5,8 L 24.8,8.8 L 24,10.5 L 23.2,8.8 L 21.5,8 L 23.2,7.2 Z" fill="white" />
    </svg>
  );
}
